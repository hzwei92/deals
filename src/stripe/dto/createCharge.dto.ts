
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
 
export class CreateChargeDto {
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;
 
  @IsNumber()
  @IsNotEmpty()
  dealId: number;
  
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
 
export default CreateChargeDto;