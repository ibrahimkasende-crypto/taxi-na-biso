# Checklist — retirer l’authentification locale temporaire (Rider)

Cette auth locale (`demo-local`) existe **uniquement** parce que Phone Auth
Supabase n’est pas encore activé (`external.phone: false`). Elle n’est **pas**
une session Supabase.

À faire **avant** tout build de production.

## Variable d’activation

Les deux conditions doivent être fausses en production :

- `__DEV__ === false` (build release Expo / Gradle)
- `EXPO_PUBLIC_DEMO_AUTH_ENABLED=false`

Même si le flag est `true`, le code refuse la connexion locale lorsque
`__DEV__` est `false`.

## Fichiers temporaires à retirer ou vider

- `apps/rider/src/features/auth/demo/demoAccounts.ts`
- `apps/rider/src/features/auth/demo/demoAuthEnabled.ts`
- `apps/rider/src/features/auth/demo/demoAuthAdapter.ts`
- `apps/rider/src/features/auth/demo/demoAuthLogic.ts`
- `apps/rider/src/features/auth/demo/demoTypes.ts`
- `apps/rider/src/features/auth/demo/demoSession.ts`
- `apps/rider/src/features/auth/demo/demoRepository.ts`
- `apps/rider/src/features/auth/demo/demoAuthAdapter.test.ts`
- branches `demo-local` dans `AuthProvider.tsx` et `authService.ts`
- garde-fous `demoLocal` dans `HomeScreen`, `ReceiptsScreen`, `TripScreen`,
  `ReportIncidentScreen`

## Numéros et code

| Téléphone | OTP local (jamais un SMS) |
|---|---|
| +243810000001 | 123456 |
| +243810000002 | 123456 |
| +243810000003 | 123456 |
| +243810000004 | 123456 |
| +243810000005 | 123456 |

## Retour exclusif à Supabase

1. Mettre `EXPO_PUBLIC_DEMO_AUTH_ENABLED=false` dans `.env`, `.env.local` et
   `.env.example`, et dans `apps/rider/app.json` :
   `extra.demoAuthEnabled: false` et `extra.embeddedDebugDemo: false`.
2. Activer Phone Auth + numéros test (ou un vrai SMS) dans TAXI-NA-BISO.
3. Supprimer `DemoAuthAdapter` et ne garder que `signInWithOtp` / `verifyOtp`.
4. Effacer la clé SecureStore `taxi_na_biso_demo_rider_session` (déjà
   auto-supprimée si le flag est off).
5. Vérifier qu’aucune session `mode: 'demo-local'` n’est créée.
6. Relancer typecheck, lint, tests Auth, puis un parcours TECNO :
   envoi OTP → verifyOtp → vraie session Supabase → profil rider.

Ne jamais embarquer `service_role` dans Rider.
