
import React, { useState, useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Generate sample data
const generateSampleData = () => {
  const data = [];
  for (let i = 1; i <= 50; i++) {
    const row = {
      id: i,
      nr: `A-${100 + i}`,
      navn: `Project ${i}`,
      ansvarlig: `User ${i % 5 + 1}`,
      tilbud: (Math.random() * 100000).toFixed(2).replace('.', ','),
      montage: (Math.random() * 20000).toFixed(2).replace('.', ','),
      underleverandor: (Math.random() * 15000).toFixed(2).replace('.', ','),
      montage2: '0,00',
      underleverandor2: '0,00',
      materialer: (Math.random() * 30000).toFixed(2).replace('.', ','),
      projektering: (Math.random() * 15000).toFixed(2).replace('.', ','),
      produktion: (Math.random() * 25000).toFixed(2).replace('.', ','),
      montage3: (Math.random() * 10000).toFixed(2).replace('.', ','),
      projektering2: (Math.random() * 12000).toFixed(2).replace('.', ','),
      produktionRealized: (Math.random() * 20000).toFixed(2).replace('.', ','),
      montageRealized: (Math.random() * 8000).toFixed(2).replace('.', ','),
      total: (Math.random() * 150000).toFixed(2).replace('.', ','),
      timerTilbage1: (Math.random() * 100).toFixed(2).replace('.', ','),
      timerTilbage2: (Math.random() * 200).toFixed(2).replace('.', ','),
      faerdigPctExMontageNu: (Math.random() * 100).toFixed(2).replace('.', ','),
      faerdigPctExMontageFoer: (Math.random() * 100).toFixed(2).replace('.', ','),
      estTimerIftFaerdigPct: (Math.random() * 300).toFixed(2).replace('.', ','),
      plusMinusTimer: (Math.random() * 50 - 25).toFixed(2).replace('.', ','),
      afsatFragt: (Math.random() * 5000).toFixed(2).replace('.', ','),
      isSubAppointment: i % 3 === 0
    };
    data.push(row);
  }
  return data;
};

const sampleData = generateSampleData();

// Simple table component with basic styling and pagination
export default function FrozenDataTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;
  
  // Filter data based on search term
  const filteredData = sampleData.filter(row => 
    row.navn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.nr.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Paginate data
  const paginatedData = filteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  
  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  
  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);
  
  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div 
        ref={tableContainerRef}
        className="border rounded-md overflow-auto"
        style={{ maxHeight: '500px' }}
      >
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[100px] bg-muted">Nr.</TableHead>
              <TableHead className="w-[250px] bg-muted">Navn</TableHead>
              <TableHead className="bg-muted">Ansvarlig</TableHead>
              <TableHead className="bg-muted">Tilbud</TableHead>
              <TableHead className="bg-muted">Montage</TableHead>
              <TableHead className="bg-muted">Underleverandør</TableHead>
              <TableHead className="bg-muted">Montage 2</TableHead>
              <TableHead className="bg-muted">Underleverandør 2</TableHead>
              <TableHead className="bg-muted">Materialer</TableHead>
              <TableHead className="bg-muted">Projektering</TableHead>
              <TableHead className="bg-muted">Produktion</TableHead>
              <TableHead className="bg-muted">Montage</TableHead>
              <TableHead className="bg-muted">Projektering</TableHead>
              <TableHead className="bg-muted">Produktion</TableHead>
              <TableHead className="bg-muted">Montage</TableHead>
              <TableHead className="bg-muted">Total</TableHead>
              <TableHead className="bg-muted">Timer tilbage</TableHead>
              <TableHead className="bg-muted">Timer tilbage</TableHead>
              <TableHead className="bg-muted">Færdig % ex montage nu</TableHead>
              <TableHead className="bg-muted">Færdig % ex montage før</TableHead>
              <TableHead className="bg-muted">Est timer ift færdig %</TableHead>
              <TableHead className="bg-muted">+/- timer</TableHead>
              <TableHead className="bg-muted">Afsat fragt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow 
                key={row.id} 
                className={row.isSubAppointment ? 'bg-muted/20' : ''}
              >
                <TableCell className="font-medium">{row.nr}</TableCell>
                <TableCell>{row.navn}</TableCell>
                <TableCell>{row.ansvarlig}</TableCell>
                <TableCell>{row.tilbud}</TableCell>
                <TableCell>{row.montage}</TableCell>
                <TableCell>{row.underleverandor}</TableCell>
                <TableCell>
                  <Input 
                    value={row.montage2} 
                    className="h-8 w-full border-0 bg-transparent focus:ring-1 focus:ring-primary"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    value={row.underleverandor2} 
                    className="h-8 w-full border-0 bg-transparent focus:ring-1 focus:ring-primary"
                  />
                </TableCell>
                <TableCell>{row.materialer}</TableCell>
                <TableCell>{row.projektering}</TableCell>
                <TableCell>{row.produktion}</TableCell>
                <TableCell>{row.montage3}</TableCell>
                <TableCell>{row.projektering2}</TableCell>
                <TableCell>{row.produktionRealized}</TableCell>
                <TableCell>{row.montageRealized}</TableCell>
                <TableCell>{row.total}</TableCell>
                <TableCell>{row.timerTilbage1}</TableCell>
                <TableCell>{row.timerTilbage2}</TableCell>
                <TableCell>
                  <Input 
                    value={row.faerdigPctExMontageNu} 
                    className="h-8 w-full border-0 bg-transparent focus:ring-1 focus:ring-primary"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    value={row.faerdigPctExMontageFoer} 
                    className="h-8 w-full border-0 bg-transparent focus:ring-1 focus:ring-primary"
                  />
                </TableCell>
                <TableCell>{row.estTimerIftFaerdigPct}</TableCell>
                <TableCell>{row.plusMinusTimer}</TableCell>
                <TableCell>{row.afsatFragt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing page {currentPage + 1} of {Math.max(1, pageCount)}
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(prev => Math.max(0, prev - 1));
                }}
                aria-disabled={currentPage === 0}
                className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, pageCount) }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(i);
                  }}
                  isActive={currentPage === i}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            {pageCount > 5 && <PaginationEllipsis />}
            
            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(prev => Math.min(pageCount - 1, prev + 1));
                }}
                aria-disabled={currentPage >= pageCount - 1}
                className={currentPage >= pageCount - 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
