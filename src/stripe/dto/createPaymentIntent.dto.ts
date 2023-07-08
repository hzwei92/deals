
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
 
export class CreatePaymentIntentDto {
  @IsNumber()
  amount: number;
}
 
export default CreatePaymentIntentDto;