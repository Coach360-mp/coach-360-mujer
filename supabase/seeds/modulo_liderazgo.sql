-- ============================================
-- MÓDULO: LIDERAZGO QUE ESCALA
-- Coach 360 - Vertical Líderes (Marco)
-- ============================================
-- Para aplicar: pegar este archivo en Supabase Studio → SQL Editor → Run.

BEGIN;

-- 1. MÓDULO BASE
INSERT INTO modulos (id, titulo, descripcion, vertical, numero_semanas, plan_requerido, activo, orden, coach, num_lecciones, test_incluido)
VALUES (
  'e4bc5a40-b19c-4ff9-9d7a-715a0030b661',
  'Liderazgo que Escala',
  'De problemas técnicos a transformación adaptativa. Framework basado en Heifetz, Lencioni, Kim Scott, Wiseman y Edmondson para líderes con equipos de 3-15 personas.',
  'lideres',
  3,
  'free',
  true,
  1,
  'Marco',
  6,
  true
);

-- 2. LECCIONES (6 total)

-- Lección 1: El problema no es tu equipo
INSERT INTO lecciones_contenido (
  id, modulo_id, numero_leccion, titulo, descripcion,
  duracion_minutos, prompt_coach, template_html, reflexion_final, orden
) VALUES (
  '33ff4c99-9a62-479c-b02b-7a384b86caf1',
  'e4bc5a40-b19c-4ff9-9d7a-715a0030b661',
  1,
  E'El problema no es tu equipo',
  NULL,
  15,
  E'**CONTEXTO DEL USUARIO:**\nLíder con equipo a cargo (3-15 personas), probablemente reactivo, sintiendo que "el problema está en el equipo" (falta de proactividad, errores recurrentes, lentitud). Llegó a Coach 360 buscando técnicas para "arreglar" a su gente.\n\n**MARCO RESPONDE:**\n\nQuiero que te detengas un segundo.\n\nAntes de seguir pensando en cómo hacer que tu equipo "funcione mejor", déjame hacerte una pregunta incómoda: **¿Y si el problema no fuera tu equipo?**\n\nSé lo que estás pensando. "Pero Marco, si vieras lo que pasa... Si no estoy encima, las cosas no salen. Los mismos errores se repiten. Nadie toma iniciativa."\n\nLo escucho todo el tiempo. Y aquí está la verdad que duele: **probablemente no es un problema de tu gente. Es un problema del sistema que creaste sin darte cuenta.**\n\nDéjame explicarte algo que cambió mi forma de liderar.\n\nRonald Heifetz, uno de los tipos más brillantes que estudió liderazgo en Harvard, hace una distinción brutal: **existen los problemas técnicos y los problemas adaptativos.**\n\n**Problema técnico:** Se resuelve con expertise. Un bug en el código. Un proceso mal documentado. Una herramienta que falta. Solución: traes al experto, arreglas la cosa, listo.\n\n**Problema adaptativo:** Requiere que la gente cambie. Nuevas formas de trabajar. Nuevas prioridades. Nuevas conversaciones. Solución: no hay "arreglo rápido". Necesitas cambiar el contexto, las creencias, las dinámicas.\n\n¿Y adivina qué? La mayoría de los líderes tratan problemas adaptativos como si fueran técnicos.\n\nTu equipo "no toma iniciativa" → Haces un taller de empoderamiento (solución técnica).\nTu equipo "comete los mismos errores" → Mandas un checklist por Slack (solución técnica).\nTu equipo "es lento" → Implementas daily standups (solución técnica).\n\nY nada cambia. Porque **el problema no es que te falte una herramienta. El problema es que tu equipo aprendió a operar en un sistema donde la iniciativa no es segura, donde equivocarse tiene consecuencia, donde la velocidad compite con la calidad.**\n\nY ese sistema lo diseñaste tú. Sin querer. Pero lo diseñaste.\n\nCada vez que interrumpes una presentación con "pero aquí faltó considerar X", estás enseñando: "no presentes hasta estar 100% seguro".\nCada vez que "corriges" un documento antes de que salga, estás enseñando: "espera a que Marco lo revise".\nCada vez que reaccionas mal a una mala noticia, estás enseñando: "no traigas problemas a Marco".\n\nNo es tu culpa. Pero **es tu responsabilidad.**\n\nAquí está la buena noticia: si el problema es el sistema, **tú puedes cambiar el sistema.** Y eso es más poderoso que cambiar personas.\n\nHoy vamos a empezar identificando **qué problemas en tu equipo son realmente adaptativos** (requieren cambio de contexto, no de herramienta).\n\nPorque hasta que no veas la diferencia, vas a seguir comprando soluciones que no resuelven nada.\n\n—Marco',
  NULL, -- TODO: pegar template_html "Mapa de Challenges" del seed original
  E'Después de mapear tus challenges, quiero que te hagas esta pregunta:\n\n**"De los problemas adaptativos que identifiqué, ¿cuál de ellos existe porque mi equipo aprendió a comportarse así en el sistema que yo diseñé?"**\n\nNo respondas rápido. Deja que esa pregunta incomode un poco.\n\nNos vemos en la próxima lección. Vamos a hablar de confianza como infraestructura.',
  1
);

-- Lección 2: Confianza como infraestructura
INSERT INTO lecciones_contenido (
  id, modulo_id, numero_leccion, titulo, descripcion,
  duracion_minutos, prompt_coach, template_html, reflexion_final, orden
) VALUES (
  '0eae3755-1161-4545-8b19-9edd804317e6',
  'e4bc5a40-b19c-4ff9-9d7a-715a0030b661',
  2,
  E'Confianza como infraestructura',
  NULL,
  18,
  E'**CONTEXTO DEL USUARIO:**\nLíder probablemente frustrado porque "falta confianza en el equipo" pero no sabe cómo generarla. Quizás intentó team buildings, dinámicas, o simplemente espera que "con el tiempo la confianza llegue". Siente que su equipo no se dice las verdades entre ellos.\n\n**MARCO RESPONDE:**\n\nHablemos de confianza.\n\nPero no de la confianza que aparece en los posters motivacionales de LinkedIn. Hablemos de **confianza como infraestructura.**\n\nLa mayoría de los líderes tratan la confianza como algo que "ojalá pase". Como si fuera un subproducto del tiempo juntos. "Ya van 6 meses trabajando, deberían confiar más entre ellos."\n\nNo funciona así.\n\nPatrick Lencioni lo dice brutal en *The Five Dysfunctions*: **la confianza en equipos de alto rendimiento no es sobre predictibilidad ("confío en que Juan va a entregar a tiempo"). Es sobre vulnerabilidad.**\n\nEs sobre poder decir: "No sé cómo resolver esto" sin sentir que perdiste credibilidad.\nEs sobre poder decir: "La cagué" sin que tu jefe piense que eres incompetente.\nEs sobre poder decir: "Necesito ayuda" sin que tu equipo asuma que no estás a la altura.\n\nY aquí está el problema: **en la mayoría de los equipos, mostrar vulnerabilidad es peligroso.**\n\n¿Por qué? Porque el líder (tú, yo, todos) sin querer diseñó un sistema donde la vulnerabilidad se castiga.\n\n**La confianza no se pide. Se diseña.**\n\nHoy vamos a hacer un audit de confianza brutal. No va a ser cómodo. Pero es el primer paso para saber qué está roto.\n\n—Marco',
  NULL, -- TODO: pegar template_html "Audit de Confianza" del seed original
  E'Después de hacer el audit:\n\n**"Si tuviera que elegir UNA dimensión de confianza para mejorar en los próximos 30 días, ¿cuál tendría más impacto en cómo mi equipo opera?"**\n\nY: **"¿Qué comportamiento mío necesito cambiar para que esa dimensión sea más segura?"**',
  2
);

-- Lección 3: Feedback que no duele (pero funciona)
INSERT INTO lecciones_contenido (
  id, modulo_id, numero_leccion, titulo, descripcion,
  duracion_minutos, prompt_coach, template_html, reflexion_final, orden
) VALUES (
  'a2471b6e-221e-4e27-b2dd-9310c75d11d4',
  'e4bc5a40-b19c-4ff9-9d7a-715a0030b661',
  3,
  E'Feedback que no duele (pero funciona)',
  NULL,
  20,
  E'**CONTEXTO DEL USUARIO:**\nLíder que probablemente evita dar feedback directo por miedo a "dañar la relación" o "desmotivar". O al revés: da feedback brutal sin contexto y después se pregunta por qué su equipo está a la defensiva.\n\n**MARCO RESPONDE:**\n\n**¿Cuántas veces evitaste dar feedback directo porque "no era el momento" o "no quería que se lo tomara mal"?**\n\nDéjame decirte algo que me costó años entender: **evitar feedback directo no es amable. Es cobarde.**\n\nKim Scott lo llama **Ruinous Empathy** (empatía ruinosa). Es cuando te importa tanto no herir sentimientos que sacrificás el crecimiento de la persona.\n\nPero también hay líderes que dan feedback brutal sin contexto. Kim Scott llama a esto **Obnoxious Aggression**.\n\n**El framework que funciona se llama Radical Candor.**\n\n1. **Care Personally** (te importa la persona, no solo el resultado)\n2. **Challenge Directly** (das feedback claro, no lo suavizas hasta que pierde significado)\n\nCuando combinás ambos → Radical Candor. Feedback que no duele innecesariamente pero tampoco se guarda nada.\n\n—Marco',
  NULL, -- TODO: pegar template_html "Matriz de Feedback" del seed original
  E'**"¿Hacia qué cuadrante tiendo por default cuando estoy estresado? ¿Empatía Ruinosa o Agresión Obnoxious?"**\n\nY: **"¿Qué frase concreta podría usar para dar feedback directo sin perder el Care Personally?"**',
  3
);

-- Lección 4: Accountability sin micromanagement
INSERT INTO lecciones_contenido (
  id, modulo_id, numero_leccion, titulo, descripcion,
  duracion_minutos, prompt_coach, template_html, reflexion_final, orden
) VALUES (
  '4533306f-edfd-4938-b989-5389c437233b',
  'e4bc5a40-b19c-4ff9-9d7a-715a0030b661',
  4,
  E'Accountability sin micromanagement',
  NULL,
  18,
  E'**CONTEXTO DEL USUARIO:**\nLíder que siente que "si no estoy encima, las cosas no salen". Probablemente micro-revisa y se justifica con "es que si no controlo, se equivocan".\n\n**MARCO RESPONDE:**\n\n**¿Cuántas horas por semana gastás revisando el trabajo de tu equipo?**\n\n**¿Y si todo ese "control" es exactamente lo que hace que tu equipo no pueda funcionar sin vos?**\n\nLiz Wiseman lo estudió. Hay dos tipos de líderes:\n\n**Multipliers:** Amplifican la inteligencia de su equipo. Crean claridad, después se salen del camino.\n**Diminishers:** Reducen la capacidad de su equipo. Micromanagean, rescatan, deciden todo.\n\nAccountability sin micromanagement requiere dos cosas:\n\n1. **Expectativas brutalmente claras.**\n2. **Alta autonomía en el cómo.**\n\nDelegar "hacé esto" no libera tu tiempo. Delegar "vos sos responsable de que esto funcione" sí.\n\n—Marco',
  NULL, -- TODO: pegar template_html "Checklist de Delegación" del seed original
  E'**"De las 8 señales, ¿cuál es la que MÁS me cuesta soltar?"**\n\nY: **"¿Qué pasaría si dejo que esta persona falle en algo pequeño para que aprenda antes de que sea algo grande?"**',
  4
);

-- Lección 5: Seguridad psicológica = velocidad
INSERT INTO lecciones_contenido (
  id, modulo_id, numero_leccion, titulo, descripcion,
  duracion_minutos, prompt_coach, template_html, reflexion_final, orden
) VALUES (
  '7a3f0de9-05e7-4365-94fd-2136b9ea56f5',
  'e4bc5a40-b19c-4ff9-9d7a-715a0030b661',
  5,
  E'Seguridad psicológica = velocidad',
  NULL,
  20,
  E'**CONTEXTO DEL USUARIO:**\nLíder que probablemente piensa que su equipo "es lento" o "no innova". Cree que es falta de talento. No ve que su equipo tiene miedo de fallar.\n\n**MARCO RESPONDE:**\n\n**¿Cuándo fue la última vez que alguien en tu equipo admitió públicamente que no sabía cómo resolver algo?**\n\nSi tenés que pensar más de 10 segundos → tu equipo no tiene seguridad psicológica.\n\nAmy Edmondson, profesora de Harvard, encontró: **los mejores equipos reportan más errores que los equipos promedio.** No porque fallen más. Sino porque **es seguro admitir errores públicamente.**\n\nSeguridad psicológica no es bajar los estándares. Es **hacer seguro el proceso de alcanzar estándares altos.**\n\n—Marco',
  NULL, -- TODO: pegar template_html "Scorecard de Seguridad Psicológica" del seed original
  E'**"De las 10 señales, ¿cuáles son las 2 donde mi equipo está más débil?"**\n\nY: **"¿Qué comportamiento MÍO hace que esas señales sean inseguras?"**',
  5
);

-- Lección 6: Tu identidad como líder evoluciona
INSERT INTO lecciones_contenido (
  id, modulo_id, numero_leccion, titulo, descripcion,
  duracion_minutos, prompt_coach, template_html, reflexion_final, orden
) VALUES (
  '146d9fcf-2655-4e66-a3f2-a8af2ee4272b',
  'e4bc5a40-b19c-4ff9-9d7a-715a0030b661',
  6,
  E'Tu identidad como líder evoluciona',
  NULL,
  22,
  E'**CONTEXTO DEL USUARIO:**\nLíder que terminó las 5 lecciones previas. Esta lección es el cierre: identidad.\n\n**MARCO RESPONDE:**\n\nHicimos 5 lecciones juntos. Pero **nada de eso funciona si no cambiás quién SOS como líder.**\n\nLa mayoría operan desde: **"Soy el que tiene las respuestas. Soy el que resuelve problemas."**\n\nEsa identidad funcionó para llegar acá. Pero **escala mal.**\n\nDe "el que tiene respuestas" → "el que hace preguntas poderosas"\nDe "el que resuelve problemas" → "el que ayuda a otros a resolverlos"\nDe "el que decide" → "el que crea contexto para que otros decidan"\n\n**Quién sos define qué hacés. Y qué hacés define qué logra tu equipo.**\n\n—Marco',
  NULL, -- TODO: pegar template_html "Declaración de Identidad" del seed original
  E'**"¿Qué tendría que pasar para que dentro de 6 meses, alguien de tu equipo dijera: ''Marco cambió''?"**\n\nNo me digas "ser mejor líder". Decime algo que puedan VER.',
  6
);

-- 3. TEST TRANSVERSAL (12 preguntas, scoring 12-48 pts)
INSERT INTO tests_transversales (
  id, modulo_id, titulo, descripcion, tipo_scoring,
  rango_min, rango_max, preguntas
) VALUES (
  'dc5d5cd8-b483-4e76-ac94-2bfa57cfee3b',
  'e4bc5a40-b19c-4ff9-9d7a-715a0030b661',
  E'¿Qué tipo de líder eres hoy?',
  NULL,
  'sumativo',
  12,
  48,
  E'[{"numero": 1, "pregunta": "Alguien de tu equipo trae un problema complejo. ¿Cuál es tu primera reacción?", "opciones": [{"letra": "A", "texto": "Analizo el problema y le doy la solución", "puntos": 2}, {"letra": "B", "texto": "Le pregunto qué opciones ya consideró y lo ayudo a pensar", "puntos": 4}, {"letra": "C", "texto": "Le digo que lo resuelva solo/a y me avise el resultado", "puntos": 3}, {"letra": "D", "texto": "Escucho el problema y después se lo asigno a alguien más capacitado", "puntos": 1}]}, {"numero": 2, "pregunta": "Tu equipo está trabajando en un proyecto importante. ¿Con qué frecuencia pedís updates?", "opciones": [{"letra": "A", "texto": "Diario o cada vez que pienso en eso", "puntos": 1}, {"letra": "B", "texto": "Acordamos un ritmo fijo (semanal/bisemanal) y lo respeto", "puntos": 4}, {"letra": "C", "texto": "Espero a que me traigan updates cuando haya algo", "puntos": 3}, {"letra": "D", "texto": "Pido updates cuando siento que las cosas se están desviando", "puntos": 2}]}, {"numero": 3, "pregunta": "Alguien cometió un error que afecta un deadline. ¿Cómo reaccionás?", "opciones": [{"letra": "A", "texto": "Pregunto qué pasó para entender y qué aprendió", "puntos": 4}, {"letra": "B", "texto": "Le muestro mi frustración y después hablamos", "puntos": 1}, {"letra": "C", "texto": "Lo corrijo yo mismo para que salga rápido", "puntos": 2}, {"letra": "D", "texto": "Le pido que lo arregle y me avise cuando esté", "puntos": 3}]}, {"numero": 4, "pregunta": "En una reunión de equipo, ¿quién habla más?", "opciones": [{"letra": "A", "texto": "Yo, porque generalmente tengo el contexto completo", "puntos": 1}, {"letra": "B", "texto": "Distribuido equitativamente — facilito para que todos participen", "puntos": 4}, {"letra": "C", "texto": "Los más seniors o los más vocales", "puntos": 2}, {"letra": "D", "texto": "Depende del tema — a veces yo, a veces ellos", "puntos": 3}]}, {"numero": 5, "pregunta": "Alguien propone una idea que vos inmediatamente ves que tiene agujeros. ¿Qué hacés?", "opciones": [{"letra": "A", "texto": "Señalo los problemas inmediatamente para que no pierda tiempo", "puntos": 1}, {"letra": "B", "texto": "Pregunto cómo pensó resolver esos agujeros antes de señalarlos", "puntos": 4}, {"letra": "C", "texto": "Dejo que lo explore y después le doy feedback", "puntos": 3}, {"letra": "D", "texto": "Le digo que la idea no va a funcionar y le explico por qué", "puntos": 2}]}, {"numero": 6, "pregunta": "¿Con qué frecuencia tu equipo trae problemas cuando todavía son pequeños?", "opciones": [{"letra": "A", "texto": "Casi nunca — los problemas llegan cuando ya son urgentes", "puntos": 1}, {"letra": "B", "texto": "Regularmente — es seguro traer problemas temprano", "puntos": 4}, {"letra": "C", "texto": "A veces — depende de quién y de qué", "puntos": 2}, {"letra": "D", "texto": "Ocasionalmente, pero solo los problemas grandes", "puntos": 3}]}, {"numero": 7, "pregunta": "Cuando delegás una responsabilidad, ¿qué nivel de autonomía das?", "opciones": [{"letra": "A", "texto": "Delego la tarea pero reviso cada paso", "puntos": 1}, {"letra": "B", "texto": "Delego el outcome, ellos deciden el cómo", "puntos": 4}, {"letra": "C", "texto": "Delego pero intervengo si veo que se desvían", "puntos": 2}, {"letra": "D", "texto": "Delego y confío, pero pido updates frecuentes", "puntos": 3}]}, {"numero": 8, "pregunta": "¿Qué tan seguido admitís públicamente \\"no sé\\" o \\"me equivoqué\\"?", "opciones": [{"letra": "A", "texto": "Casi nunca — se supone que debo tener las respuestas", "puntos": 1}, {"letra": "B", "texto": "Regularmente — modelo vulnerabilidad primero", "puntos": 4}, {"letra": "C", "texto": "Solo cuando es obvio que no sé algo", "puntos": 2}, {"letra": "D", "texto": "A veces, pero trato de evitarlo", "puntos": 3}]}, {"numero": 9, "pregunta": "Cuando algo falla en tu equipo, ¿cuál es tu primera pregunta?", "opciones": [{"letra": "A", "texto": "¿Quién fue responsable de esto?", "puntos": 1}, {"letra": "B", "texto": "¿Qué aprendimos y cómo evitamos que pase de nuevo?", "puntos": 4}, {"letra": "C", "texto": "¿Por qué no me avisaron antes?", "puntos": 2}, {"letra": "D", "texto": "¿Qué necesitás de mí para arreglarlo?", "puntos": 3}]}, {"numero": 10, "pregunta": "Tu equipo tiene un desacuerdo fuerte sobre cómo resolver algo. ¿Qué hacés?", "opciones": [{"letra": "A", "texto": "Decido yo cuál es el mejor approach", "puntos": 1}, {"letra": "B", "texto": "Facilito la conversación para que ellos lleguen a una decisión", "puntos": 4}, {"letra": "C", "texto": "Dejo que discutan y veo qué sale", "puntos": 3}, {"letra": "D", "texto": "Les doy mi opinión y después decidimos", "puntos": 2}]}, {"numero": 11, "pregunta": "¿Qué tan cómodo estás con que tu equipo experimente con nuevas formas de trabajar?", "opciones": [{"letra": "A", "texto": "Prefiero que sigan procesos probados", "puntos": 1}, {"letra": "B", "texto": "Los aliento a experimentar en scope pequeño sin pedir permiso", "puntos": 4}, {"letra": "C", "texto": "Está bien si me lo consultan antes", "puntos": 2}, {"letra": "D", "texto": "Depende del riesgo del experimento", "puntos": 3}]}, {"numero": 12, "pregunta": "Si tuvieras que describir tu rol en una frase, ¿cuál elegirías?", "opciones": [{"letra": "A", "texto": "\\"Soy el que tiene las respuestas y toma las decisiones difíciles\\"", "puntos": 1}, {"letra": "B", "texto": "\\"Creo el contexto para que mi equipo tome buenas decisiones sin mí\\"", "puntos": 4}, {"letra": "C", "texto": "\\"Ayudo a mi equipo cuando se traban\\"", "puntos": 3}, {"letra": "D", "texto": "\\"Me aseguro de que las cosas salgan bien\\"", "puntos": 2}]}]'::jsonb
);

-- 4. PERFILES RESULTADO (4 arquetipos)

-- El Bombero (12-20 pts)
INSERT INTO perfiles_resultado (
  id, test_id, nombre_perfil, rango_min, rango_max,
  descripcion, fortalezas, areas_desarrollo,
  lecciones_criticas, accion_sugerida, orden
) VALUES (
  'bfb43e20-effe-4925-b1aa-65817d381ceb',
  'dc5d5cd8-b483-4e76-ac94-2bfa57cfee3b',
  E'El Bombero',
  12,
  20,
  E'Liderazgo reactivo: apaga incendios constantemente sin tiempo para pensar estratégicamente.',
  E'["Respuesta rápida a crisis", "Disponibilidad inmediata", "Alta capacidad de trabajo"]'::jsonb,
  E'["Visión estratégica", "Delegación efectiva", "Prevención de problemas"]'::jsonb,
  E'[1, 4, 6]'::jsonb,
  E'Comienza por la Lección 1 para identificar si estás resolviendo problemas técnicos cuando necesitas transformación adaptativa.',
  1
);

-- El Controlador (21-27 pts)
INSERT INTO perfiles_resultado (
  id, test_id, nombre_perfil, rango_min, rango_max,
  descripcion, fortalezas, areas_desarrollo,
  lecciones_criticas, accion_sugerida, orden
) VALUES (
  '82d3424b-ac46-4e67-a22e-0425575ce2f7',
  'dc5d5cd8-b483-4e76-ac94-2bfa57cfee3b',
  E'El Controlador',
  21,
  27,
  E'Micromanagement: crees que delegar es perder control, y terminas siendo el cuello de botella del equipo.',
  E'["Atención al detalle", "Alto estándar de calidad", "Compromiso personal"]'::jsonb,
  E'["Confianza en el equipo", "Empoderamiento", "Escalabilidad"]'::jsonb,
  E'[2, 4, 5]'::jsonb,
  E'Prioriza la Lección 2 sobre arquitectura de decisiones para dejar de ser el único tomando decisiones.',
  2
);

-- El Entrenador (28-37 pts)
INSERT INTO perfiles_resultado (
  id, test_id, nombre_perfil, rango_min, rango_max,
  descripcion, fortalezas, areas_desarrollo,
  lecciones_criticas, accion_sugerida, orden
) VALUES (
  '4875fba3-1b9f-4550-844a-81f1e9fea408',
  'dc5d5cd8-b483-4e76-ac94-2bfa57cfee3b',
  E'El Entrenador',
  28,
  37,
  E'En el camino: alternas entre resolver tú mismo y desarrollar a otros, pero aún no escala de forma consistente.',
  E'["Desarrollo de personas", "Balance operativo-estratégico", "Consciencia de gaps"]'::jsonb,
  E'["Consistencia de enfoque", "Sistemas escalables", "Influencia sin autoridad"]'::jsonb,
  E'[3, 4, 5]'::jsonb,
  E'Enfócate en la Lección 3 sobre estructuras que piensan para institucionalizar tu impacto.',
  3
);

-- El Arquitecto de Sistemas (38-48 pts)
INSERT INTO perfiles_resultado (
  id, test_id, nombre_perfil, rango_min, rango_max,
  descripcion, fortalezas, areas_desarrollo,
  lecciones_criticas, accion_sugerida, orden
) VALUES (
  '479d840c-0626-4485-bb64-f389b3cc9c30',
  'dc5d5cd8-b483-4e76-ac94-2bfa57cfee3b',
  E'El Arquitecto de Sistemas',
  38,
  48,
  E'Liderazgo sistémico: diseñas estructuras donde las decisiones correctas emergen sin ti, y tu equipo crece exponencialmente.',
  E'["Pensamiento sistémico", "Empoderamiento genuino", "Impacto escalable"]'::jsonb,
  E'["Mantener cercanía humana", "Evitar sobre-estructura", "Adaptar a contextos cambiantes"]'::jsonb,
  E'[2, 5, 6]'::jsonb,
  E'Profundiza en Lección 5 sobre influencia sin autoridad para expandir tu impacto más allá de tu equipo directo.',
  4
);

COMMIT;

-- ✅ UUID del módulo: e4bc5a40-b19c-4ff9-9d7a-715a0030b661
-- ✅ Total: 1 módulo + 6 lecciones + 1 test + 4 perfiles
-- ⚠️ Los 6 template_html quedaron como NULL — pegar uno por uno desde el seed original si los necesitás.
