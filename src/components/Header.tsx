import React from 'react';
import { Users } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-full">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">B.O.F Certification Platform</h1>
            <p className="text-green-100">Bourdillon Omijeh Foundation - Certificate Automation</p>
          </div>
        </div>
      </div>
    </header>
  );
};