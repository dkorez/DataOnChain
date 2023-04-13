import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DocumentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'document content',
    required: true,
  })
  data: string;

  @IsOptional()
  @ApiProperty({
    type: String,
    description: "document's content type",
    required: false,
  })
  type: string;
}
