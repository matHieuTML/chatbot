// formSpammer.js
import qs from 'qs';

// URL du formulaire
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfE__MzkkMHyzdeEO1QL-l9U7ydWkhrkpx-8RxpJ6V36eUoDQ/formResponse';

// Champs fixes (ne changent pas)
const fixedFields = {
    "fbzx": "6966590789036434933", // Remplacez avec votre valeur 
};

// Fonction pour obtenir des données générées par l'API OpenAI
const getGeneratedData = async (openai) => {
    try {
        const prompt = "Génère un nom et un prénom français, puis crée un email avec le domaine @stu-digital-campus.fr en utilisant la première lettre du prénom suivie du nom de famille. Par exemple, si le prénom est 'Kuba' et le nom est 'Peront', l'email sera 'k_peront@stu-digital-campus.fr'. Ensuite, génère une punchline créative et humoristique en français pour une présentation personnelle. La punchline doit refléter l'idée suivante : 'C'est pour cela qu'il faut savoir parler de soi et que la première impression reste. Que tu sois professionnel(le), timide, sérieux(se) ou encore sur le ton de l'humour. Il n'y a pas de mauvaise manière de parler de soi. Soyez-vous mêmes ! Attention vos phrases de présentation seront lues donc soignez votre première impression.' Exemple : 'Je suis tellement bon en cuisine que Philippe Etchebest, j'en fais mon commis !'. Formate la réponse comme suit : Prénom: [Prénom], Nom: [Nom], Email: [email@stu-digital-campus.fr], Punchline: [Punchline].";

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
        });

        const generatedContent = response.choices[0].message.content.trim();
        
        // Utiliser des expressions régulières pour extraire les données
        const prenomMatch = generatedContent.match(/Prénom:\s*([^\n,]+)/);
        const nomMatch = generatedContent.match(/Nom:\s*([^\n,]+)/);
        const emailMatch = generatedContent.match(/Email:\s*([^\n,]+)/);
        const punchlineMatch = generatedContent.match(/Punchline:\s*([^\n]+)/);

        const prenom = prenomMatch ? prenomMatch[1].trim() : "Prénom Inconnu";
        const nom = nomMatch ? nomMatch[1].trim() : "Nom Inconnu";
        const email = emailMatch ? emailMatch[1].trim() : "email@stu-digital-campus.fr";
        const punchline = punchlineMatch ? punchlineMatch[1].trim() : "Punchline Inconnue";

        return { prenom, nom, email, punchline };
    } catch (error) {
        console.error("Error fetching data from OpenAI:", error);
        throw error;
    }
};

// Générer des données aléatoires avec OpenAI
const generateRandomData = async (openai) => {
    const generatedData = await getGeneratedData(openai);
    return {
        ...fixedFields, // Inclure les champs fixes
        "entry.2005620554": `${generatedData.prenom} ${generatedData.nom}`, // Nom complet généré par OpenAI
        "entry.1045781291": generatedData.email, // Email généré par OpenAI
        "entry.839337160": generatedData.punchline, // Punchline générée par OpenAI
    };
};

// Fonction pour envoyer le formulaire
const submitForm = async (data) => {
    try {
        // Sérialiser les données avec qs
        const serializedData = qs.stringify(data);

        // Envoyer la requête avec les en-têtes appropriés
        const response = await fetch(FORM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: serializedData,
        });

        console.log(`Form submitted successfully: ${response.status}`);
    } catch (error) {
        console.error(`Error submitting form: ${error.message}`);
    }
};

// Spammer le formulaire
export const spamForm = async (count, openai) => {
    for (let i = 0; i < count; i++) {
        const data = await generateRandomData(openai);
        console.log(`Submitting data: ${JSON.stringify(data)}`);
        await submitForm(data);
    }
};