import bcrypt from "bcrypt"
import User from "../models/user.models.js"
import jwt from "jsonwebtoken"
import { inngest } from "../inngest/client.js"

const registerUser = async (req, res) => {
    try {
        const { userName, password, email, role, skills = [] } = req.body;

        // console.log("req.body = ",req.body)
        // console.log("email :", email);
        // console.log("userName :", userName);


        // if fields are empty
       if (!String(userName ?? "").trim() || !String(email ?? "").trim() || !String(password ?? "").trim()) {
            return res
                .status(400)
                .json(
                    {
                        success: false,
                        message: "All fields are required."
                    }
                )
        }

        // user does exists already with the email or userName

        const existingUser = await User.findOne({
            $or: [{ userName }, { email }]
        }
        )

        if (existingUser) return res.status(409).json({
            success: false,
            message: "User with this email or UserName already exists."
        })

        // fresh user -> hash the password and create an object for the user in the database

        const hashedPassword = await bcrypt.hash(password, 10)
        // create in database
        const user = await User.create({
            userName, email, password: hashedPassword, role, skills
        })


        // FIRE inngest event
        try {
            await inngest.send({
                name: "user/signup",
                data: {
                    email, userName
                }
            });
        } catch (inngestError) {
            console.error("⚠️ Inngest event failed, but continuing:", inngestError.message);
        }

        const token = jwt.sign(

            { _id: user._id, role: user.role, userName: user.userName, email: user.email }, process.env.JWT_SECRET
        )

        // find by id and remove the password
        const createdUser = await User.findById(user._id)
            .select("-password")
        // user didn't created

        if (!createdUser) {
            return res.status(400).json({
                success: false,
                message: "Error while registering."
            })
        }

        // success
        return res.status(201).json({
            success: true,
            createdUser,
            token,
            message: "User created successfully!"
        })
    } catch (error) {
        console.log("Error is", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error during registration."
        });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // console.log("req.body = ",req.body)
    //     console.log("email :", email);
    // All fields are required
    try {
        if ([email, password].some((field) => field?.trim() === "")) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            })
        }

        // email should exist in database
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ success: false, message: "User with this email does not exist." })

        // password checking
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const token = jwt.sign(
            { _id: user._id, role: user.role, userName: user.userName, email: user.email }, process.env.JWT_SECRET
        )

        const loggedInUser = await User.findById(user._id).select("-password");

        return res.status(201).json({
            success: true,
            loggedInUser,
            token,
            message: "User successfully logged in."
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error during login."
        });
    }

}

const logoutUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        // console.log("Logout token: ", token)
        if (!token) return res.status(400).json({ success: false, messagae: "Unauthorized User" })

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    messagae: "Unauthorized User"
                })
            }

            console.log("successfully logged out")
            return res.status(201).json({
                success: true,
                message: "User logged out successfully."
            })
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error during logout."
        });
    }
}

const updateUser = async (req, res) => {
    const { skills = [], email, role } = req.body;

    // console.log(req.body)

    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({ messagae: "Forbidden" })
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ messagae: "User not found." })

        await User.updateOne(
            {email},
            {skills: skills.length ? skills : user.skills, role}
        )

        return res.status(201).json({ messagae: "User updated successfully!" })
    } catch (error) {
        console.log(error)
         return res.status(500).json({
            success: false,
            message: "Internal server error during updating user details."
        });
    }
}
const getUsers = async (req, res) =>{
    try {
        if(req.user.role !== "admin"){
            return  res.status(403).json({
                messagae:"Forbidden"
            })
        }
    
        const users = await User.find().select("-password")
        return res.json(users);
    } catch (error) {
         return res.status(500).json({
            success: false,
            message: "Internal server error during updating user details."
        });
    }
}
export {
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
    getUsers,
}