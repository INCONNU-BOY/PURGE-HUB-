import sendMail from "../config/Mail.js";
import genToken from "../config/Token.js"
import User from "../models/User.model.js"
import bcrypt from 'bcryptjs'

export const signUp = async (req, res) => {
    try {
        const { name, email, password, username } = req.body;

        if (!name || !email || !username || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long!" });
        }

        const existingEmail = await User.findOne({ email });
        const existingUsername = await User.findOne({ username });

        if (existingEmail) {
        return res.status(400).json({ message: "Email already exists!" });
        }

        if (existingUsername) {
        return res.status(400).json({ message: "Username already exists!" });
        }

        const hashpassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            username,
            email,
            password: hashpassword
        });

        const token = await genToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000, 
            secure: true, 
            sameSite: "None"
        });

        

        return res.status(200).json(user);

    } catch (error) {
        return res.status(500).json({ message: `signup error ${error}` });
    }
};




export const signIn = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "username and password are required!" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password!" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Invalid username or password!" });
        }

        const token = await genToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
           secure: true, 
            sameSite: "None"
        });

    
        return res.status(200).json(user);

    } catch (error) {
        return res.status(500).json({ message: `signin error ${error}` });
    }
};


export const signOut = async (req ,res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({message:"signOut successfully !"})
    } catch (error) {
        return res.status(500).json({message:`signOut Error ${error}`})
    }
}

 export const sendotp = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid Email" })
            
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        user.resetotp = otp,
        user.otpexpire = Date.now() + 5 * 60 * 1000
        user.isotpverified = false
        
        await user.save()
        await sendMail(email, otp)
        return res.status(200).json({message:"Email Successfully Send"})
    } catch (error) {
        return res.status(500).json({message:`send otp error ${error}`})
    }
}


export const verifyotp = async (req, res) => {
    try {
        const { email, otp } = req.body
        const user = await User.findOne({ email })
        
        if (!user || user.resetotp !== otp || user.otpexpire < Date.now())
        {
            return res.status(400).json({message:"Invalid/Expired otp"})
        }

        user.isotpverified = true
        user.resetotp = undefined
        user.otpexpire = undefined
        
        await user.save()
        return res.status(200).json({message:"otp verified"})
    } catch (error) {
         return res.status(500).json({message:`Verify otp error ${error}`})
    }
}


export const resetpassword = async (req, res) => {
    try {

        const { email, password } = req.body
        
        const user = await User.findOne({ email })
        if (!user || !user.isotpverified) {
            return res.status(400).json({message:"Please Enter Your New Password !"})
        }

        const hashedpassword =await bcrypt.hash(password, 10)
        user.password = hashedpassword
        user.isotpverified = false
        await user.save()
        return res.status(200).json({message:"Password reset Successfully"})
    } catch (error) {
         return res.status(500).json({message:`reset otp error ${error}`})
    }
}
