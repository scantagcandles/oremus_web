// scripts/update-imports.ts
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const importMappings = {
  // Glass -> UI
  '@/components/ui/Button': '@/components/ui/Button',
  '@/components/ui/Input': '@/components/ui/Input',
  '@/components/ui/Card': '@/components/ui/Card',
  '@/components/ui/Select': '@/components/ui/Select',
  '@/components/ui/Modal': '@/components/ui/Modal',
  
  // Services
  '@/services/payment/PaymentService': '@/services/payment/PaymentService',
  '@/services/auth/AuthService': '@/services/auth/AuthService',
  '@/services/candle/CandleService': '@/services/candle/CandleService',
  '@/services/massService': '@/services/mass/MassService',
}

function updateImportsInFile(filePath: string) {
  try {
    let content = readFileSync(filePath, 'utf8')
    let modified = false
    
    Object.entries(importMappings).forEach(([oldImport, newImport]) => {
      const regex = new RegExp(`from ['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g')
      if (content.match(regex)) {
        content = content.replace(regex, `from '${newImport}'`)
        modified = true
      }
    })
    
    // Update component usage
    content = content.replace(/<Button variant="glass"/g, '<Button variant="glass"')
    content = content.replace(/Button>/g, 'Button>')
    
    if (modified) {
      writeFileSync(filePath, content, 'utf8')
      console.log(`âœ… Updated: ${filePath}`)
    }
  } catch (error) {
    console.error(`âŒ Error updating ${filePath}:`, error)
  }
}

function walkDir(dir: string) {
  const files = readdirSync(dir)
  
  files.forEach(file => {
    const filePath = join(dir, file)
    const stat = statSync(filePath)
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath)
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      updateImportsInFile(filePath)
    }
  })
}

console.log('ðŸ”„ Updating imports...')
walkDir('.')
console.log('âœ… Import update complete!')
