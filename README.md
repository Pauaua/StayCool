# Stay Cool - Agenda

Agenda integral para personas de todas las edades: permite un registro personal no solo sobre tu bienestar asociado a la salud, sino también de tu imagen, actividades sociales, higiene y gastos, todo para que te mantengas Cool. Incluye suscripciones premium (Agenda Cool+, planes Básico/Full) vía RevenueCat, un sistema de recompensas de juego (**MOOney**) para personalizar un avatar, y **Mi Resumen**, que genera un PDF con el resumen de tu actividad brindando estadísticas útiles en relación a tu información.

Realizado con Expo + React Native + TypeScript, NativeWind, React Navigation, TanStack Query y Supabase (Auth + Postgres + Storage + Edge Functions).

## Índice

- [Stack](#stack)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Configurar Supabase](#configurar-supabase)
- [Correr la app localmente](#correr-la-app-localmente)
- [Arquitectura](#arquitectura)
- [Módulos](#módulos)
- [Suscripciones y MOOney](#suscripciones-y-mooney)
- [Build y actualizaciones OTA con EAS](#build-y-actualizaciones-ota-con-eas)
- [Monitoreo y analítica](#monitoreo-y-analítica)
- [Recuperar contraseña](#recuperar-contraseña)
- [Notificaciones push locales](#notificaciones-push-locales)
- [Tests](#tests)
- [Seguridad de datos](#seguridad-de-datos)
- [Consideraciones importantes / troubleshooting](#consideraciones-importantes--troubleshooting)

## Stack

- **App**: React Native 0.81 + React 19, Expo SDK 54 (con `expo-dev-client` para development builds), TypeScript 5.9.
- **Navegación**: React Navigation (native-stack + bottom-tabs).
- **UI**: NativeWind (Tailwind para React Native), `react-native-svg`, `expo-linear-gradient`, `react-native-view-shot`.
- **Datos remotos**: TanStack Query (`@tanstack/react-query`) + Zod para validación.
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions).
- **Monetización**: RevenueCat (`react-native-purchases`) para suscripciones.
- **Analítica / Monitoreo**: PostHog (`posthog-react-native`) y Sentry (`@sentry/react-native`).
- **Otros nativos/Expo**: `expo-notifications`, `expo-image-picker`, `expo-file-system`, `expo-print`, `expo-sharing`, `expo-secure-store`, `async-storage`, `react-native-calendars`.
- **Build/Tooling**: EAS Build/Update, ESLint + Prettier, Jest + `jest-expo`.

## Requisitos previos

- Node.js 18+ y npm.
- Cuenta de [Supabase](https://supabase.com) (proyecto propio).
- Expo Go (para probar rápido) o un build de desarrollo propio (`eas build --profile development`) si necesitás probar deep links con esquema custom (`agendacool://...`) — ver [Recuperar contraseña](#recuperar-contraseña).
- Opcional: cuenta de [RevenueCat](https://www.revenuecat.com), [Sentry](https://sentry.io) y [PostHog](https://posthog.com) si vas a trabajar en suscripciones/monitoreo/analítica (la app funciona sin ellas, ver [Variables de entorno](#variables-de-entorno)).
- `eas-cli` si vas a generar builds nativos o actualizaciones OTA (ver [Build y actualizaciones OTA con EAS](#build-y-actualizaciones-ota-con-eas)).

## Instalación

```bash
git clone https://github.com/PauFugit/StayCool.git
cd StayCool
npm install
cp .env.example .env   # completar con tus propias claves, ver siguiente sección
```

## Variables de entorno

Copia `.env.example` a `.env` y completa:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_SENTRY_DSN=https://xxxx@sentry.io/xxxx
EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxxxxxxx
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_xxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=goog_xxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_FACEBOOK_APP_ID=1234567890123456
```

Las dos primeras usan el prefijo `NEXT_PUBLIC_` (no `EXPO_PUBLIC_`) a propósito. Expo solo inlinea automáticamente al bundle las variables con prefijo `EXPO_PUBLIC_`, así que para poder usar exactamente esos nombres, `app.config.js` (que corre en Node, no en el bundle) las lee con `dotenv` y las expone en `extra`; `src/config/env.ts` las recupera en runtime con `expo-constants`. Si cambias esas variables en `.env`, tenés que reiniciar `expo start` (no basta con recargar la app) para que `app.config.js` las vuelva a leer.

Todas son claves públicas (publishable key, DSN público, API keys públicas de PostHog/RevenueCat) — **nunca pongas la `service_role` key de Supabase acá**, esa solo vive en las Edge Functions, inyectada por Supabase. Sin las variables de Sentry/PostHog/RevenueCat la app sigue funcionando (quedan en no-op/deshabilitadas), lo cual es útil para levantar el proyecto rápido sin dar de alta esas cuentas.

## Configurar Supabase

1. Crea un proyecto en supabase.com.
2. Corre las migraciones **en orden** (`0001` a `0008`): `npx supabase db push`, o pega cada archivo de `supabase/migrations/` en el SQL Editor del dashboard en orden numérico. El login es solo email + contraseña, sin proveedores sociales — no hace falta configurar nada en Authentication → Providers más allá de lo que Supabase trae por defecto.
3. En Authentication → URL Configuration, agregá `agendacool://*` a **Redirect URLs** (necesario para que funcione "olvidé mi contraseña" — ver más abajo).
4. Despliega las Edge Functions:
   ```bash
   npx supabase functions deploy gastos-resumen
   npx supabase functions deploy resumen
   npx supabase functions deploy revenuecat-webhook
   ```
5. Los buckets `outfits`, `hairstyles` y `avatars` se crean automáticamente en las migraciones (privados, con políticas RLS por carpeta de usuario).
6. Si vas a trabajar con suscripciones, configurá el webhook de RevenueCat apuntando a la Edge Function `revenuecat-webhook` (ver [Suscripciones y MOOney](#suscripciones-y-mooney)).

## Correr la app localmente

```bash
npm install
npx expo start
```

Escanea el QR con Expo Go, o corre `npm run ios` / `npm run android` con un simulador. También hay `npm run web` si querés previsualizar en navegador (soporte limitado, no es el target principal).

## Arquitectura

- `src/features/<modulo>/` — cada módulo (bienestar, imagen, pelo, higiene, social, gastos, gustos, notas, auth, home, premium, resumen) vive aislado con sus propios `types/`, `services/` (llamadas a Supabase), `hooks/` (TanStack Query) y `screens/`.
- `src/navigation/` — un navigator (Stack) por módulo que tiene más de una pantalla (Home, Bienestar, Higiene, Imagen, Pelo, Social, Gastos, Gustos, Notas). La navegación principal no es un bottom tab bar sino un **rail lateral fijo** (`MainShell.tsx` + `SideRail.tsx`) con los módulos como íconos verticales — con tantos módulos, una barra inferior de solo íconos deja de ser usable, así que se optó por un rail que se expande/colapsa con un tap mostrando los nombres. Los módulos no activos quedan montados con `display: none` en vez de desmontarse, para no perder su estado de navegación interno al cambiar de módulo y volver.
- `src/lib/` — cliente de Supabase, tipos de la base de datos, Sentry, query client.
- `supabase/migrations/`:
  - `0001_init.sql` — esquema base: bienestar, imagen, cara (removido luego, ver `0008`), higiene, pelo, social, gastos. Índices por `(user_id, fecha)`, RLS por usuario en todas las tablas, triggers de `updated_at`, bucket de Storage para fotos de outfits.
  - `0002_gustos_notas.sql` — módulos Gustos y Notas (ver detalle abajo), mismo patrón de RLS/índices/timestamps.
  - `0003_seed_default_hygiene_items.sql` — siembra el checklist de higiene por defecto (ducha, cepillado + hilo dental, enjuague bucal, desodorante) para cada usuario nuevo, y retroactivamente para cuentas ya creadas que aún no tengan ítems.
  - `0004_hair_wash_hygiene_item.sql` — agrega "Lavado de pelo" como ítem especial del checklist (`hygiene_items.is_hair_wash`); al marcarlo completado además queda un registro con fecha/hora exacta en `hair_wash_logs`.
  - `0005_hairstyle_photo_and_budget.sql` — foto opcional en peinados (`hairstyle_logs.photo_path` + bucket `hairstyles`) y presupuesto mensual de gastos (`profiles.monthly_budget`).
  - `0006_moo_ney.sql` — nivel de suscripción (`profiles.premium_tier`, sincronizado desde RevenueCat vía webhook) y sistema de recompensas MOOney (ver [Suscripciones y MOOney](#suscripciones-y-mooney)).
  - `0007_avatars_storage.sql` — bucket `avatars` para las piezas/skins del avatar de MOOney.
  - `0008_imagen_pelo_restructure.sql` — elimina el módulo independiente **Cara** y fusiona su pantalla dentro de **Imagen** (junto con Vestuario y Zapatos); agrega el perfil de Pelo.
- `supabase/functions/` — Edge Functions para lógica sensible:
  - `gastos-resumen` — calcula el total/desglose de gastos en el servidor.
  - `resumen` — arma el contenido de **Mi Resumen** (ver módulo Resumen).
  - `revenuecat-webhook` — recibe notificaciones de entitlement de RevenueCat y actualiza `profiles.premium_tier`.
  - `_shared/rateLimit.ts` — rate limiting compartido entre funciones.

El módulo **Higiene** (`src/features/higiene`) es el patrón de referencia: registro + Storage/RLS + paginación con scroll infinito (`useInfiniteQuery`) + historial. Los demás módulos siguen la misma estructura de carpetas; algunos (bienestar, imagen, pelo) usan pantallas más simples porque su volumen de datos es menor, pero comparten el mismo enfoque de tipos + servicio + hook + pantalla.

## Módulos

- **Bienestar** — registro asociado a salud/bienestar general.
- **Imagen** — incluye Vestuario, Zapatos y la sección de Cara (fusionada acá desde el antiguo módulo independiente, ver `0008_imagen_pelo_restructure.sql`).
- **Pelo** — perfil de pelo, peinados (con foto opcional) y lavado de pelo integrado al checklist de higiene.
- **Higiene** — checklist diario con ítems por defecto y personalizables (`AddHygieneItemPicker`).
- **Social** — actividades sociales.
- **Gastos** — dos formularios (quick/detailed), presupuesto mensual, resumen calculado en Edge Function.
- **Gustos** — dos formularios: `taste_quick_logs` (nombre + descripción + fecha/hora, para cosas random) y `taste_detailed_logs` (música, series, películas, libros). Los campos varían mucho según la categoría (bandas/instrumentos/ritmos en música, autor/saga en libros, director/elenco en series y películas), así que en vez de tener una tabla por categoría, `taste_detailed_logs` guarda `category`, `name`, `genre` y `notes` como columnas y el resto en una columna `details jsonb` — evita tener que migrar el esquema cada vez que se agregue un campo específico de una categoría nueva.
- **Notas** — registro de ideas, dos niveles: `note_quick_logs` (nombre + descripción + cómo te sentiste) y `note_detailed_logs` (nombre, dónde estabas, la idea, sentires, pensamientos).
- **Premium** — pantalla de suscripción (Agenda Cool+, planes Básico/Full) y la tienda de avatar (`AvatarShopScreen`) que gasta MOOney.
- **Resumen** ("Mi Resumen") — genera un PDF (`pdfService.ts`) con el resumen de actividad del usuario y permite compartirlo (`shareService.ts`), usando datos armados por la Edge Function `resumen`.

## Suscripciones y MOOney

- Las suscripciones (planes **Básico** y **Full**) se gestionan con **RevenueCat** (`react-native-purchases`). La verdad sobre el tier del usuario vive en RevenueCat; `profiles.premium_tier` es una copia de lectura rápida en Supabase, actualizada únicamente por la Edge Function `revenuecat-webhook` cuando RevenueCat notifica un cambio de entitlement.
- Un trigger de Postgres (`guard_premium_tier`, en `0006_moo_ney.sql`) revierte silenciosamente cualquier intento del cliente de escribir `premium_tier` directamente — solo la service role (usada por la Edge Function) puede moverlo.
- **MOOney** es una moneda de juego (recompensa del plan Full) para desbloquear y comprar piezas de un avatar personalizable (cara, pelo, tono de piel, accesorios) en `AvatarShopScreen`. Es **completamente independiente del dinero real** que el usuario registra en el módulo Gastos — nunca se mezcla con `expense_quick_logs` / `expense_detailed_logs` en ningún cálculo.

## Build y actualizaciones OTA con EAS

```bash
npm install -g eas-cli
eas login
eas build:configure

# Builds nativos
eas build --platform android --profile preview
eas build --platform ios --profile preview
eas build --platform android --profile production

# Actualización OTA (sin pasar por las tiendas, solo JS/assets)
eas update --branch production --message "fix: ajuste en checklist de higiene"
```

`eas.json` define perfiles `development`, `preview` y `production`. El `projectId` real (que da `eas build:configure`) ya está cargado en `app.config.js`.

## Monitoreo y analítica

- **Sentry**: se inicializa en `App.tsx` vía `src/lib/sentry.ts`. Sin `EXPO_PUBLIC_SENTRY_DSN` queda deshabilitado (no rompe la app).
- **PostHog**: cliente centralizado en `src/analytics/posthog.ts`. Sin API key, todos los `analytics.track(...)` son no-op — así el código de producto puede instrumentar eventos desde el día uno sin depender de que analytics ya esté configurado.

## Recuperar contraseña

Flujo completo de "olvidé mi contraseña" vía deep link:

1. `ForgotPasswordScreen` llama a `supabase.auth.resetPasswordForEmail(email, { redirectTo: "agendacool://reset-password" })`.
2. Supabase manda un mail con un link a `agendacool://reset-password#access_token=...&refresh_token=...&type=recovery`.
3. `useAuth` escucha ese deep link (con `expo-linking`, tanto si la app estaba cerrada como abierta), parsea los params con `src/lib/parseAuthDeepLink.ts` y llama `supabase.auth.setSession(...)`, lo que dispara el evento `PASSWORD_RECOVERY`.
4. Mientras `isPasswordRecovery` es `true`, `RootNavigator` muestra `ResetPasswordScreen` en vez de la app normal — ahí el usuario elige la contraseña nueva (`completePasswordReset`).

**Importante para poder probarlo**: los links con esquema custom (`agendacool://...`) solo reabren la app cuando corriste un **build propio** (`eas build --profile development` o superior) — Expo Go no puede interceptar esquemas de otras apps, así que en Expo Go el paso 2 no vuelve a abrir la app (mismo límite que ya vimos con la confirmación de email). El código ya queda listo para cuando compiles un build real.

## Notificaciones push locales

`src/notifications/notifications.ts` expone `scheduleDailyReminder` para recordatorios recurrentes (desmaquillarse, checklist de higiene sin completar). Se piden permisos al iniciar la app; los horarios se configuran por usuario en `profiles.makeup_reminder_time` / `profiles.hygiene_reminder_time`.

## Tests

```bash
npm test
```

Jest + `jest-expo`. Por ahora cubre `parseAuthDeepLink.ts` (el parser de los links de recuperación de contraseña) como base — es la pieza más frágil y nueva del proyecto. Se puede ir sumando más tests de servicios/hooks puros a medida que crece la app.

Otros comandos útiles:

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Seguridad de datos

Todas las tablas de usuario tienen RLS activo con política `auth.uid() = user_id` (o `= id` en `profiles`). No hay ninguna tabla de datos personales sin RLS. La tabla `function_rate_limits` está bloqueada para el cliente (`using (false)`) y solo la tocan las Edge Functions con la service role key. El tier de suscripción (`profiles.premium_tier`) solo puede escribirlo la service role (ver [Suscripciones y MOOney](#suscripciones-y-mooney)), nunca el cliente.

## Consideraciones importantes / troubleshooting

- **Nunca commitear `.env`** ni ninguna clave `service_role` de Supabase. Solo claves públicas van en `.env` / `.env.example`.
- Cambios en `.env` requieren reiniciar `expo start` (no alcanza con recargar la app), porque las variables se leen en `app.config.js`, que corre en Node al levantar el bundler.
- Las migraciones de `supabase/migrations/` deben aplicarse **en orden numérico**; saltarse una puede romper migraciones posteriores que dependen de columnas/tablas previas.
- Deep links con esquema custom (`agendacool://...`) no funcionan en Expo Go — necesitás un build de desarrollo propio (`eas build --profile development`) para probar recuperación de contraseña o confirmación de email de punta a punta.
- `premium_tier` y el balance de MOOney no deben modificarse manualmente desde el cliente: están protegidos por triggers/policies y la única fuente de verdad es la Edge Function `revenuecat-webhook` / la lógica server-side correspondiente.
- Al agregar un módulo nuevo, seguí el patrón de Higiene (`types/` + `services/` + `hooks/` + `screens/`, RLS por usuario, índices por `(user_id, fecha)`) para mantener consistencia.
