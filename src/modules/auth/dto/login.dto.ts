import {IsPhoneNumber, IsString} from "class-validator";

export class LoginDto {
    @IsPhoneNumber()
    phone: string
    @IsString()
    passwd: string
}