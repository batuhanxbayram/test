import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";



export function SignIn() {
  return (
    <section
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(/img/background.jpg)` }} // buraya kendi resim yolunu koy
    >
      <Card className="w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-6">
            LOGO
          </Typography>
        </div>
        <form className="flex flex-col gap-6">
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 font-medium"
            >
              Kullanıcı Adı
            </Typography>
            <Input
              size="lg"
              placeholder="Kullanıcı Adı"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>

          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 font-medium"
            >
              Şifre
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>

          <Button className="mt-4" fullWidth>
            Giriş Yap
          </Button>
        </form>
      </Card>
    </section>
  );
}

export default SignIn;
