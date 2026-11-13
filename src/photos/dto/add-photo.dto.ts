import { IsOptional, IsString, IsUrl, Matches } from 'class-validator';

/** Se envía UNA de las dos: url (enlace a una imagen) o dataUrl (archivo subido). */
export class AddPhotoDto {
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  url?: string;

  @IsOptional()
  @IsString()
  @Matches(/^data:image\/(jpeg|png|webp);base64,/, {
    message: 'dataUrl debe ser una imagen JPEG, PNG o WEBP en base64',
  })
  dataUrl?: string;
}
