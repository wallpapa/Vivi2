import { Button } from '@/components/ui/button'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Wallet, Pill, Syringe } from 'lucide-react'

interface AccountCardProps {
  title: string
  amount: number
  description: string
  icon: React.ReactNode
}

function AccountCard({ title, amount, description, icon }: AccountCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Detail account</DropdownMenuItem>
            <DropdownMenuItem>Transfer money</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-2xl font-bold mt-1">
          ${amount.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </div>
    </div>
  )
}

export function AccountPage() {
  const accounts = [
    {
      title: 'FREE CASH',
      amount: 4012409,
      description: 'This is money for this need',
      icon: <Wallet className="h-5 w-5 text-primary" />,
    },
    {
      title: 'DRUG PURCHASE',
      amount: 4120130,
      description: 'No rek: 124 1245 3567 0987',
      icon: <Pill className="h-5 w-5 text-primary" />,
    },
    {
      title: 'TREATMENT FUND',
      amount: 3341789,
      description: 'This is money for this need',
      icon: <Syringe className="h-5 w-5 text-primary" />,
    },
  ]

  const inactiveAccounts = [
    {
      title: 'MONTHLY RENT',
      amount: 6123434,
      description: 'No rek: 009 2345 2224 3445',
    },
    {
      title: 'DRUG PURCHASE',
      amount: 3246245,
      description: 'No rek: 094 3345 2234 5678',
    },
    {
      title: 'TREATMENT FUND',
      amount: 5234234,
      description: 'No rek: 004 3334 5555 2344',
    },
  ]

  const totalAssets = accounts.reduce((sum, account) => sum + account.amount, 0)
  const liquidAssets = accounts.slice(0, 2).reduce((sum, account) => sum + account.amount, 0)
  const physicalAssets = accounts[2].amount

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Account</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline">Transfer money</Button>
          <Button>Add new account</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-sm font-medium text-muted-foreground">TOTAL ASSET VALUE</h2>
          <p className="text-3xl font-bold mt-2">${totalAssets.toLocaleString()}</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-sm font-medium text-muted-foreground">LIQUID ASSETS</h2>
          <div className="flex items-center space-x-2 mt-2">
            <p className="text-3xl font-bold">${liquidAssets.toLocaleString()}</p>
            <span className="text-green-500 text-sm">+4.51%</span>
          </div>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-sm font-medium text-muted-foreground">PHYSICAL ASSETS VALUE</h2>
          <div className="flex items-center space-x-2 mt-2">
            <p className="text-3xl font-bold">${physicalAssets.toLocaleString()}</p>
            <span className="text-red-500 text-sm">-2.51%</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">List Account</h2>
            <p className="text-sm text-muted-foreground">All account setup manually</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {accounts.map((account) => (
              <AccountCard key={account.title} {...account} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Inactive List</h2>
          <div className="grid grid-cols-3 gap-6">
            {inactiveAccounts.map((account) => (
              <div
                key={account.title}
                className="p-6 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-muted-foreground">{account.title}</h3>
                  <Button variant="outline" size="sm">
                    Activate
                  </Button>
                </div>
                <p className="text-2xl font-bold text-muted-foreground mt-2">
                  ${account.amount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {account.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 