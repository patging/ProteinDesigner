import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import {z} from "zod"
import { createClient } from "@supabase/supabase-js";


dotenv.config() // load env variables
const app = express();


app.use(express.json())
app.use(cookieParser());

app.use(cors({origin: "http://localhost:5173", credentials : true}))

app.get("/health", (req, res) => res.json({ok: true}))



if(!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY){
    console.log("check .env file");
    throw new Error("undefined url or keys");
}

const supabaseURL = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// used for auth endponts
const supabaseAnon = createClient(supabaseURL, supabaseAnonKey);

// used for database write
const supabaseService = createClient(supabaseURL, supabaseServiceKey);

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_ANON_KEY exists:", !!process.env.SUPABASE_ANON_KEY);
console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

app.post("/signup", async (req, res) => {
    const Body = z.object({
        name: z.string().min(1),
        email: z.email(),
        password: z.string().min(8),
      });

    const parsed = Body.safeParse(req.body);
    if(!parsed.success){
        console.log("signup req body:", req.body)
        return res.status(400).json({
            message: "Invalid input",
          });
    }
    const {name, email, password} = parsed.data;

    const {data, error} = await supabaseAnon.auth.signUp({
        email,
        password
    });

    if(error){
        return res.status(400).json({message: error.message})
    }
    if(!data.user){
        return res.status(400).json({message: "signup failed"})
    }

    const {error: e} = await supabaseService.from("user_profile").insert({
        user_id: data.user.id,
        user_name: name,
        user_email: email
    })

    if(e){
        console.error(e);
        return res.status(500).json({
            message: "Profile creation failed",
        })
    }

    return res.json({
        user: {
            id: data.user.id,
            email: data.user.email
        }
    })

})

app.post("/login", async (req, res) => {
    const Body = z.object({
        email: z.email(),
        password: z.string().min(1)
    })
    const parsed = Body.safeParse(req.body)
    if(!parsed.success){
        console.log("error parsing body", req.body)
        return res.status(400).json({message: "Invalid input"})
    }

    const {email, password} = parsed.data

    const {data, error} = await supabaseAnon.auth.signInWithPassword({
        email,
        password
    })
    if(error){
        return res.status(400).json({message: error.message});
    }
    if(!data.user){
        return res.status(400).json({message: "no user"})
    }

    return res.json({
        user: {
            id: data.user.id,
            email: data.user.email
        }
    })
    
})





const PORT = Number(process.env.PORT)

app.listen(PORT, () => {
    console.log("app listening on", `${PORT}`)
})