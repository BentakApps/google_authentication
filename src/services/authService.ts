import { OAuth2Client } from "google-auth-library";
import jwt, { JwtPayload } from "jsonwebtoken";
import { readSecret } from '../util/dockerSecret.js';
//import  from "jsonwebtoken";

export default class AuthService {
  private static readonly clientId = "934173952337-ejc5hhli75b4vmghqjjc6jiufomptit2.apps.googleusercontent.com";
  private static readonly client = new OAuth2Client(this.clientId);
  
  public static readonly validateGoogleToken = async (idToken:string) => {
    const ticket = await this.client.verifyIdToken({
      idToken: idToken,
      audience: this.clientId
    });
    const payload = ticket.getPayload();
    const user = {
      id_provider: "google",
      user_id: payload!.sub,
      first_name: payload?.given_name,
      last_name: payload?.family_name,
      name: payload?.name,
      photo: payload?.picture,
      email: payload?.email
    }
    return user;
  }

  public static readonly validateToken = (token:string) => {
    if(token){
      const secret = Buffer.from(readSecret("TOKEN_SECRET"),'base64');
      const options = {};
      const user = jwt.verify(token, secret, options);
      console.log(user);
      return user;
    }
    return null;
  }
  
  public static readonly getToken = (user:any, expiresIn:string) => {
    console.log(user);
    
    const payload = {
      sub: user.user_id,
      aud: user.id_provider,
      name: user.name,
      firstname: user.first_name,
      lastname: user.last_name,
      photo: user.photo,
      reputation: user.reputation
    };
    
    const secret = Buffer.from(readSecret("TOKEN_SECRET"),'base64');
    
    const options = {
      expiresIn: expiresIn,
    }

    return jwt.sign(payload, secret, options);
  }




}