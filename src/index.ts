import express, {CookieOptions, Request, Response} from 'express';
import cookieParser from 'cookie-parser';
import AuthService from '@services/authService.js';
import NetworkService from '@services/networkService.js';

const app = express();
const port = (process.env.PORT || 80) as number;

const cookieOptions:CookieOptions = {
  domain:'api.postobarato.tk',
  path:'/refreshtoken',
  //sameSite:'none',//for localhost only
  sameSite:'strict',
  secure: true,
  httpOnly: true,
}
const cookieMaxAge = 7776000000;//+90*24*3600*1000 ms = 90 days

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});*/


app.get('/', async (req:Request, res:Response) => {
  console.log("auth get");
  console.log(req.route);
  res.json("hello world!!!");
});

app.use(cookieParser());

app.post('/googleauth', async (req:Request, res:Response) => {
  const cookies = req.cookies;
  console.log(cookies);

  let refreshToken = '';
  let idToken = '';
  //validate token
  const googleToken = req.body.googleToken;
  const user = await AuthService.validateGoogleToken(googleToken);  
  //check user
  const userFromDB = (await NetworkService.getUserFromDB(user.id_provider, user.user_id)).data;
  if(userFromDB.length>0){
    refreshToken = AuthService.getToken(userFromDB[0],'90d');
    idToken = AuthService.getToken(userFromDB[0],'1h');
  }
  if (userFromDB.length == 0) {
    let newUser = await NetworkService.addUser(user);
    refreshToken = AuthService.getToken(newUser,'90d');
    idToken = AuthService.getToken(newUser,'1h');
    console.log(newUser);
  }
  
  res.cookie('refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge:cookieMaxAge
  });
  res.json(idToken);
});

app.get('/refreshtoken', async (req:Request, res:Response) => {
  console.log("Origin:", req.get('origin'));
  //domain = origin.replace(/^https?:\/\//, '');
  const cookies = req.cookies;
  const refreshToken = cookies.refresh_token
  const user:any = AuthService.validateToken(refreshToken);
  console.log(user);
  if(user){
    const userFromDB = (await NetworkService.getUserFromDB(user.aud, user.sub)).data;
    console.log(userFromDB);
  
    let newRefreshToken = '';
    let newIdToken = '';
    if(userFromDB.length>0 && userFromDB[0].status == 'active') {
      newRefreshToken = AuthService.getToken(userFromDB[0],'90d');
      newIdToken = AuthService.getToken(userFromDB[0],'1h');
      res.cookie('refresh_token', newRefreshToken, {
        ...cookieOptions,
        maxAge:cookieMaxAge
      });
      res.json(newIdToken);
    } else {
      res.status(401).end();
    }
  } else {
    res.status(401).end();
  }
});

app.post('/logout', async (req:Request, res:Response) => {
  res.cookie('refresh_token', 0, {
    ...cookieOptions,
    expires: new Date(0)
  }).end();
  //res.end();
});

app.listen(port, () => {
  console.log(`App running at port ${port}`);
});
