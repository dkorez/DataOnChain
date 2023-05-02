import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class IpfsDocumentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'document encoded content',
    required: true,
  })
  content: string;
}
