
'use client';

import { Header } from '@/components/dashboard/header';
import { DocumentTable } from '@/components/dashboard/document-table';
import { UploadDialog } from '@/components/dashboard/upload-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon, UploadIcon } from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">My Vault</h1>
          <div className="relative flex-1 md:grow-0">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="w-full rounded-lg bg-card pl-8 md:w-[200px] lg:w-[336px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <UploadDialog>
            <Button className="flex items-center gap-2">
              <UploadIcon className="h-4 w-4" />
              <span>Upload Document</span>
            </Button>
          </UploadDialog>
        </div>
        <DocumentTable searchTerm={searchTerm} />
      </main>
    </div>
  );
}
