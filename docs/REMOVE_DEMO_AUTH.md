# Checklist — retirer l’authentification de démonstration

À faire **avant** tout build de production.

1. Mettre `EXPO_PUBLIC_DEMO_MODE=false` dans `apps/rider/.env.local` (et ne pas
   la passer à `true` dans le pipeline de prod).
2. Retirer tous les numéros test du tableau de bord Supabase
   (Authentication → Providers → Phone → Test phone numbers).
3. Vérifier qu’aucune mention « Mode démonstration » / OTP de test n’est
   visible dans Rider (déjà retiré de l’interface).
4. Configurer MessageBird ou un autre fournisseur SMS compatible.
5. Vérifier la longueur OTP de production (6 chiffres par défaut).
6. Activer un CAPTCHA si le projet le propose.
7. Configurer les limitations de débit (rate limit OTP).
8. Tester l’envoi et la réception de vrais SMS.
9. Révoquer tous les comptes de test (Authentication → Users + lignes
   `public.users` / `public.rider_profiles` associées).
10. Refaire un build de production Rider **sans** `EXPO_PUBLIC_DEMO_MODE=true`.

Ne jamais embarquer `service_role` dans l’application mobile.
