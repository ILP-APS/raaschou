import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmployeeList from "./EmployeeList";
import CaseOverview from "./CaseOverview";
import SmsLogTable from "./SmsLogTable";

const TidsregistreringContent: React.FC = () => {
  return (
    <div className="p-4">
      <Tabs defaultValue="employees" className="w-full">
        <TabsList>
          <TabsTrigger value="employees">Medarbejdere</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="sms-log">SMS-log</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-4">
          <EmployeeList />
        </TabsContent>

        <TabsContent value="cases" className="mt-4">
          <CaseOverview />
        </TabsContent>

        <TabsContent value="sms-log" className="mt-4">
          <SmsLogTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TidsregistreringContent;
