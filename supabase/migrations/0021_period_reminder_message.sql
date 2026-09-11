-- Mensaje personalizable del aviso de "se viene el período". Si es null, el
-- cliente usa el texto predeterminado ("Se aproxima desprendimiento de
-- endometrio, ¡Prepárate!") — ver useProfile.ts. El aviso ahora se activa
-- automáticamente con is_menstruating + last_period_date (ya no hay un
-- toggle aparte para prenderlo/apagarlo), así que period_reminder_enabled
-- queda sin uso pero se deja en la tabla para no romper filas existentes.
alter table public.profiles
  add column period_reminder_message text;
