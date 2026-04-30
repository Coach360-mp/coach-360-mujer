-- ============================================
-- FUNCIÓN: reset_usuario_por_email(email)
-- ============================================
-- Borra TODA la data del usuario en las 22+ tablas relacionadas,
-- pero NO toca auth.users — el login con la misma cuenta sigue funcionando.
--
-- Útil para QA: probar el flow desde cero (signup → onboarding → dashboard)
-- sin tener que crear cuentas nuevas.
--
-- INVOCACIÓN (Supabase Studio → SQL Editor):
--   select * from public.reset_usuario_por_email('mreveco12@gmail.com');
--
-- Devuelve: { uid_resuelto, email, status }
-- ============================================

drop function if exists public.reset_usuario_por_email(text);

create or replace function public.reset_usuario_por_email(p_email text)
returns table (
  uid_resuelto uuid,
  email text,
  status text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid;
begin
  select id into uid from auth.users where auth.users.email = p_email;
  if uid is null then
    return query select null::uuid, p_email, 'usuario no encontrado en auth.users';
    return;
  end if;

  -- Mensajes (deben ir antes que conversaciones por FK)
  delete from public.mensajes        where conversacion_id in (select id from public.conversaciones        where usuario_id = uid);
  delete from public.mensajes_clara  where conversacion_id in (select id from public.conversaciones_clara  where usuario_id = uid);
  delete from public.mensajes_leo    where conversacion_id in (select id from public.conversaciones_leo    where usuario_id = uid);
  delete from public.mensajes_marco  where conversacion_id in (select id from public.conversaciones_marco  where usuario_id = uid);

  -- Conversaciones (unificada + legacy)
  delete from public.conversaciones        where usuario_id = uid;
  delete from public.conversaciones_clara  where usuario_id = uid;
  delete from public.conversaciones_leo    where usuario_id = uid;
  delete from public.conversaciones_marco  where usuario_id = uid;

  -- Tablas con usuario_id
  delete from public.actividad_diaria   where usuario_id = uid;
  delete from public.badges_usuario     where usuario_id = uid;
  delete from public.progreso_modulos   where usuario_id = uid;
  delete from public.registro_ciclo     where usuario_id = uid;
  delete from public.resultados_test    where usuario_id = uid;
  delete from public.sesiones_coach     where usuario_id = uid;

  -- Tablas con user_id
  delete from public.coach_proactive_messages where user_id = uid;
  delete from public.company_licenses         where user_id = uid;
  delete from public.daily_checkins           where user_id = uid;
  delete from public.fcm_tokens               where user_id = uid;
  delete from public.habitos_completados      where user_id = uid;
  delete from public.habitos_usuario          where user_id = uid;
  delete from public.historial_puntos         where user_id = uid;
  delete from public.leader_profile           where user_id = uid;
  delete from public.mi_equilibrio            where user_id = uid;
  delete from public.onboarding_respuestas    where user_id = uid;
  delete from public.sesiones_compradas       where user_id = uid;
  delete from public.user_coach_history       where user_id = uid;
  delete from public.user_context             where user_id = uid;
  delete from public.user_gamification        where user_id = uid;
  delete from public.user_preferences         where user_id = uid;
  delete from public.user_vertical_tools      where user_id = uid;

  -- Perfil al final
  delete from public.perfiles where id = uid;

  return query select uid, p_email, 'reset OK — auth.user intacto, data borrada';
end;
$$;

-- Solo el service_role puede ejecutar (protege contra abuso desde cliente)
revoke all on function public.reset_usuario_por_email(text) from public, authenticated, anon;
grant execute on function public.reset_usuario_por_email(text) to service_role;
