import axios, { AxiosResponse } from "axios";

class NetworkService {
  private static readonly db = axios.create({
    baseURL: 'http://db/'
  });
  
  public static readonly getUserFromDB = async (idProvider:string, userId:string) => {
    return await this.db.get('/user',
      {
        params:{
          idProvider: idProvider,
          userId: userId
        }
      }
    );
  }

  public static readonly addUser = async (user:any) => {
    return await this.db.post('/user',user);
  }
}

export default NetworkService;