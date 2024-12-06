import { getUserById, getUsers, loginUser, registerUser, } from "../controllers/users.js";
import User from "../models/users.js";
import { Op } from "sequelize";

export function usersRoutes(app) {
    app.post("/login", async (request, reply) => {
        reply.send(await loginUser(request.body, app));
    }).post(
        "/logout",
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            const token = request.headers["authorization"].split(" ")[1]; // Récupérer le token depuis l'en-tête Authorization

            reply.send({ logout: true });
        }
    );
    //inscription
    app.post("/register", async (request, reply) => {
        reply.send(await registerUser(request.body, app.bcrypt));
    });

    app.get("/confirm/:mail", async (request, reply) => {
        const email = request.params.mail; // Correction ici
        const user = await User.findOne({
            where: {
                email: {
                    [Op.eq]: email,
                },
            },
        });
        console.log(user)
        // set user as confirmed
        user.verified = true;
        await user.save();
        reply.send({ verified: true });
    }
    );

    //récupération de la liste des utilisateurs
    app.get("/users", async (request, reply) => {
        reply.send(await getUsers());
    });
    //récupération d'un utilisateur par son id
    app.get("/users/:id", async (request, reply) => {
        reply.send(await getUserById(request.params.id));
    });
}
