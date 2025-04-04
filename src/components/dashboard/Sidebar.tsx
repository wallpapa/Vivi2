import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  UserCog,
  CreditCard,
  ShoppingCart,
  Package,
  Boxes,
  BarChart,
  HelpCircle,
} from 'lucide-react'

export function Sidebar() {
  const menuItems = [
    {
      title: 'CLINIC',
      items: [
        { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/' },
        { name: 'Reservations', icon: <Calendar className="w-5 h-5" />, path: '/reservations' },
        { name: 'Patients', icon: <Users className="w-5 h-5" />, path: '/patients' },
        { name: 'Treatments', icon: <Stethoscope className="w-5 h-5" />, path: '/treatments' },
        { name: 'Staff List', icon: <UserCog className="w-5 h-5" />, path: '/staff' },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        { name: 'Accounts', icon: <CreditCard className="w-5 h-5" />, path: '/accounts' },
        { name: 'Sales', icon: <BarChart className="w-5 h-5" />, path: '/sales' },
        { name: 'Purchases', icon: <ShoppingCart className="w-5 h-5" />, path: '/purchases' },
        { name: 'Payment Method', icon: <CreditCard className="w-5 h-5" />, path: '/payment' },
      ],
    },
    {
      title: 'PHYSICAL ASSET',
      items: [
        { name: 'Stocks', icon: <Package className="w-5 h-5" />, path: '/stocks' },
        { name: 'Peripherals', icon: <Boxes className="w-5 h-5" />, path: '/peripherals' },
      ],
    },
  ]

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">Z</span>
          </div>
          <span className="text-xl font-semibold">Zendenta</span>
        </div>
        <div className="mt-4 flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-gray-200 rounded-lg" />
          <div>
            <div className="text-sm font-medium">Avicena Clinic</div>
            <div className="text-xs text-muted-foreground">845 Euclid Avenue, CA</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4">
        {menuItems.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
              {section.title}
            </div>
            {section.items.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center space-x-3 px-2 py-2 rounded-lg text-muted-foreground hover:bg-gray-50 hover:text-primary transition-colors"
              >
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Link
          to="/support"
          className="flex items-center space-x-3 px-2 py-2 rounded-lg text-muted-foreground hover:bg-gray-50 hover:text-primary transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm">Customer Support</span>
        </Link>
      </div>
    </div>
  )
} 