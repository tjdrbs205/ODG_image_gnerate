export class GalleryImageDto {
  id!: string;
  prompt!: string;
  status!: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt!: Date;
  error?: string | null;

  imageUrl?: string;
}
