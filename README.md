# Orion IA (Web Local)

Application web simple avec IA locale maison (sans cle API, sans Ollama, sans internet) pour devis transport Paris -> Tunisie.

## Lancer le projet

1. Lance le serveur web:
   - `python3 -m http.server 8080`
2. Ouvre `http://localhost:8080`
3. Pose tes questions.

## Notes

- Tarif par defaut: `4 EUR / kg`
- Regles:
  - `valise`: prix selon `kg + distance`
  - `objet de valeur`: prix selon `valeur declaree + distance`
  - distance estimee depuis Paris selon la ville (Marseille, Lyon, etc.)
- `Entree` envoie le message.
- `Shift + Entree` fait un retour a la ligne.
- Le bouton `Nouveau chat` vide l'historique local de la conversation.
- Les parametres sont enregistres dans le navigateur (localStorage).
