import User from "../models/users.js";
import { Op } from "sequelize";
import nodemailer from 'nodemailer';
import mjml2html from 'mjml';

async function generateID(id) {
    const { count } = await findAndCountAllUsersById(id);
    if (count > 0) {
        id = id.substring(0, 5);
        const { count } = await findAndCountAllUsersById(id);
        id = id + (count + 1);
    }
    return id;
}

export async function getUsers() {
    return await User.findAll();
}

export async function getUserById(id) {
    return await User.findByPk(id);
}

export async function findAndCountAllUsersById(id) {
    return await User.findAndCountAll({
        where: {
            id: {
                [Op.like]: `${id}%`,
            },
        },
    });
}

export async function findAndCountAllUsersByEmail(email) {
    return await User.findAndCountAll({
        where: {
            email: {
                [Op.eq]: email,
            },
        },
    });
}

export async function getScoreBoard() {
    return await User.findAll({
        attributes: ['username', 'score'],
        order: [
            ['score', 'DESC']
        ],
        limit: 5
    });
}

export async function findAndCountAllUsersByUsername(username) {
    return await User.findAndCountAll({
        where: {
            username: {
                [Op.eq]: username,
            },
        },
    });
}

export async function registerUser(userDatas, bcrypt) {
    if (!userDatas) {
        return { error: "Aucune donnée à enregistrer" };
    }
    const { firstname, lastname, username, email, password } = userDatas;
    console.log(userDatas)
    if (!firstname || !lastname || !username || !email || !password) {
        return { error: "Tous les champs sont obligatoires" };
    }
    //vérification que l'email n'est pas déjà utilisé
    const { count: emailCount } = await findAndCountAllUsersByEmail(email);
    if (emailCount > 0) {
        return { error: "L'adresse email est déjà utilisée." };
    }

    //vérification que le pseudo n'est pas déjà utilisé
    const { count: usernameCount } = await findAndCountAllUsersByUsername(
        username
    );
    if (usernameCount > 0) {
        return { error: "Le nom d'utilisateur est déjà utilisé." };
    }
    //création de l'identifiant
    let id = await generateID(
        (lastname.substring(0, 3) + firstname.substring(0, 3)).toUpperCase()
    );
    //hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password);
    //création de l'utilisateur dans la base de données
    const user = {
        id,
        firstname,
        lastname,
        username,
        email,
        password: hashedPassword,
    };
    const createdUser = await User.create(user);

    // Créer un lien de confirmation (ici un exemple simple)
    const confirmationLink = ` http://localhost:5173/auth/confirmEmail/${email}`;

    // Construire l'email avec MJML
    const mjmlTemplate = `
      <mjml>
        <mj-body>
          <mj-section>
            <mj-column>
              <mj-text font-size="20px" font-family="Helvetica">
                Bienvenue, ${firstname} ${lastname}!
              </mj-text>
              <mj-text>
                Merci de vous être inscrit sur notre plateforme. Cliquez sur le lien ci-dessous pour confirmer votre inscription.
              </mj-text>
              <mj-button href="${confirmationLink}">
                Confirmer mon inscription
              </mj-button>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;

    const htmlOutput = mjml2html(mjmlTemplate);

    // Configuration de nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail', // ou tout autre service de messagerie
        auth: {
            user: 'ilyaszahaf2002@gmail.com', // remplacez par votre email
            pass: 'qhoy dlkt qpmw fscd', // remplacez par votre mot de passe
        },
    });

    const mailOptions = {
        from: 'ilyaszahaf2002@gmail.com',
        to: email,
        subject: 'Confirmation d’inscription',
        html: htmlOutput.html,
    };

    // Envoi de l'email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Erreur lors de l\'envoi de l\'email : ', error);
        } else {
            console.log('Email envoyé : ' + info.response);
        }
    });

    return createdUser;
}
//msg d'erreur en anglais
export async function loginUser(userDatas, app) {
    if (!userDatas) {
        return { error: "no data to login" };
    }
    const { email, password } = userDatas;
    if (!email || !password) {
        return { error: "All fields are required" };
    }
    //vérification que l'email est utilisé
    const { count, rows } = await findAndCountAllUsersByEmail(email);
    if (count === 0) {
        return {
            error: "No user found with this email",
        };
    } else if (rows[0].verified === false) {
        return {
            error: "Check your email to confirm your account",
        };
    }
    //récupération de l'utilisateur
    const user = await User.findOne({
        where: {
            email: {
                [Op.eq]: email,
            },
        },
    });
    //comparaison des mots de passe
    const match = await app.bcrypt.compare(password, user.password);
    if (!match) {
        return { error: "ID/PASSWORD incorrect" };
    }
    // Générer le JWT après une authentification réussie
    const token = app.jwt.sign(
        { id: user.id, username: user.username },
        { expiresIn: "3h" }
    );
    return { token, user: { id: user.id, username: user.username, email: user.email, firstname: user.firstname, lastname: user.lastname, score: 0 } };
}

export async function updateScore(id) {
    const user = await User.findByPk(id);
    if (!user) {
        return { error: "User not found" };
    }
    user.score += 700;

    await user.save();
    return user;
}
