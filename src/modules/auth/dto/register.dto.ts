import {IsPhoneNumber, IsString} from "class-validator";

export class RegisterDto {
    @IsPhoneNumber()
    phone: string
    @IsString()
    passwd: string

}
