"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { MarketsTable } from "@/components/admin/markets-table"
import { CompaniesTable } from "@/components/admin/companies-table"
import { MarketDialog } from "@/components/admin/market-dialog"
import { CompanyDialog } from "@/components/admin/company-dialog"
import type { Market, Company } from "@/lib/data-context"

export default function CatalogosPage() {
  const { markets, companies } = useData()
  const [marketDialogOpen, setMarketDialogOpen] = useState(false)
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false)
  const [editingMarket, setEditingMarket] = useState<Market | null>(null)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)

  const handleEditMarket = (market: Market) => {
    setEditingMarket(market)
    setMarketDialogOpen(true)
  }

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company)
    setCompanyDialogOpen(true)
  }

  const handleCloseMarketDialog = () => {
    setMarketDialogOpen(false)
    setEditingMarket(null)
  }

  const handleCloseCompanyDialog = () => {
    setCompanyDialogOpen(false)
    setEditingCompany(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Catálogos</h1>
        <p className="text-muted-foreground">Gestiona mercados y empresas</p>
      </div>

      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="markets">Mercados</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Empresas</CardTitle>
              <Button onClick={() => setCompanyDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Empresa
              </Button>
            </CardHeader>
            <CardContent>
              <CompaniesTable companies={companies} markets={markets} onEdit={handleEditCompany} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="markets" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mercados</CardTitle>
              <Button onClick={() => setMarketDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Mercado
              </Button>
            </CardHeader>
            <CardContent>
              <MarketsTable markets={markets} onEdit={handleEditMarket} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MarketDialog open={marketDialogOpen} onClose={handleCloseMarketDialog} market={editingMarket} />

      <CompanyDialog
        open={companyDialogOpen}
        onClose={handleCloseCompanyDialog}
        company={editingCompany}
        markets={markets}
      />
    </div>
  )
}
