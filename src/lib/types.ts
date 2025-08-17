export type Document = {
  id: string;
  name: string;
  category: 'Medical' | 'Legal' | 'Academic' | 'Financial' | 'Personal' | 'Other';
  createdAt: Date;
  size: string;
  content: string;
  userId?: string;
};
