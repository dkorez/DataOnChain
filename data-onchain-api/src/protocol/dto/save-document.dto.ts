import { IsString, IsNotEmpty } from 'class-validator';

export class SaveDocumentDto {
  @IsString()
  @IsNotEmpty()
  data: string;
}
