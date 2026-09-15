# Comptes de démonstration Taxi Na Biso (Rider)

Ces numéros sont **fictifs**. Ils ne correspondent à aucune ligne réelle et ne
doivent jamais être remplacés par le numéro personnel d’un utilisateur.

## Contrainte OTP

Le code demandé pour la démo était `1234` (4 chiffres).

**Supabase Auth hébergé et GoTrue local exigent un OTP de 6 à 10 chiffres.**
Un jeton `1234` est rejeté par le serveur. L’application n’accepte donc pas
`1234` en mentant : le code de démonstration configuré est `123456`.

## Numéros de test (rôle passager / rider)

| Téléphone E.164 | OTP (vérifié par Supabase) | Rôle attendu |
|---|---|---|
| +243810000001 | 123456 | rider / client |
| +243810000002 | 123456 | rider / client |
| +243810000003 | 123456 | rider / client |
| +243810000004 | 123456 | rider / client |
| +243810000005 | 123456 | rider / client |

Aucun de ces comptes ne peut choisir le rôle `driver` ou `admin` depuis Rider.

## Configuration

### Projet cloud TAXI-NA-BISO

Dans le tableau de bord :

1. Authentication → Providers → Phone → activer Phone.
2. Test phone numbers / Test OTP, format sans `+` :
   `243810000001=123456`
   (une entrée par numéro).
3. Ne pas brancher encore un fournisseur SMS réel (MessageBird, Twilio, …).
4. Enregistrer.

`auth.sms.test_otp` du fichier `config.toml` ne s’applique **pas** au projet
hébergé : uniquement à Supabase local / self-hosted.

### Local / self-hosted

Voir `[auth.sms.test_otp]` dans `infra/supabase/config.toml`, puis :

```bash
pnpm db:start
```

Le TECNO ne peut pas joindre `localhost`. Il faut l’URL LAN, `adb reverse`,
ou le projet cloud.

## Variable interne

`EXPO_PUBLIC_DEMO_MODE=true` n’est **pas** un secret. Elle n’autorise pas
l’OTP et n’affiche rien à l’utilisateur : elle restreint seulement les
numéros acceptés côté client avant l’appel `signInWithOtp`.

## Suppression avant production

Suivre `docs/REMOVE_DEMO_AUTH.md` : retirer ces numéros, désactiver le mode
démo, révoquer les utilisateurs de test, brancher un vrai SMS, refaire un build.
