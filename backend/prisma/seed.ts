import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

import {
  PrismaClient,
  ProductStatus,
  Role,
} from '../src/generated/prisma/client'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

interface SeedProduct {
  name: string
  slug: string
  categorySlug: string
  description: string
  price: string
  salePrice?: string
  imageUrl: string
  isFeatured?: boolean
  variants: Array<{
    sku: string
    colorCode: string
    sizeCode: string
    price?: string
    stock: number
  }>
}

const categories = [
  {
    name: 'Chairs',
    slug: 'chairs',
    imageUrl: '/fuzzy/assets/images/product/3.png',
  },
  {
    name: 'Tables',
    slug: 'tables',
    imageUrl: '/fuzzy/assets/images/product/21.png',
  },
  {
    name: 'Sofas',
    slug: 'sofas',
    imageUrl: '/fuzzy/assets/images/product/11.png',
  },
  {
    name: 'Hanging Chairs',
    slug: 'hanging-chairs',
    imageUrl: '/fuzzy/assets/images/product/22.png',
  },
  {
    name: 'Cabinets',
    slug: 'cabinets',
    imageUrl: '/fuzzy/assets/images/product/23.png',
  },
  {
    name: 'Cupboards',
    slug: 'cupboards',
    imageUrl: '/fuzzy/assets/images/product/23.png',
  },
  {
    name: 'Lighting',
    slug: 'lighting',
    imageUrl: '/fuzzy/assets/images/product/24.png',
  },
  {
    name: 'Decoration',
    slug: 'decoration',
    imageUrl: '/fuzzy/assets/images/product/25.png',
  },
]

const colors = [
  { name: 'Black', code: 'BLACK', hex: '#111111' },
  { name: 'White', code: 'WHITE', hex: '#FFFFFF' },
  { name: 'Brown', code: 'BROWN', hex: '#8B5E3C' },
  { name: 'Gray', code: 'GRAY', hex: '#9CA3AF' },
  { name: 'Beige', code: 'BEIGE', hex: '#D9C7A3' },
]

const sizes = [
  { name: 'Small', code: 'S' },
  { name: 'Medium', code: 'M' },
  { name: 'Large', code: 'L' },
]

const products: SeedProduct[] = [
  {
    name: 'Buddy Chair',
    slug: 'buddy-chair',
    categorySlug: 'chairs',
    description:
      'A comfortable accent chair with modern saddle arms and durable fabric.',
    price: '120.00',
    salePrice: '102.25',
    imageUrl: '/fuzzy/assets/images/product/1.png',
    isFeatured: true,
    variants: [
      { sku: 'CHA-BUD-BEI-M', colorCode: 'BEIGE', sizeCode: 'M', stock: 18 },
      { sku: 'CHA-BUD-BRO-L', colorCode: 'BROWN', sizeCode: 'L', stock: 12 },
    ],
  },
  {
    name: 'Wingback Chair',
    slug: 'wingback-chair',
    categorySlug: 'chairs',
    description:
      'Classic wingback chair with a supportive high back and modern finish.',
    price: '35.00',
    salePrice: '25.00',
    imageUrl: '/fuzzy/assets/images/product/3.png',
    isFeatured: true,
    variants: [
      { sku: 'CHA-WIN-BEI-M', colorCode: 'BEIGE', sizeCode: 'M', stock: 25 },
      { sku: 'CHA-WIN-GRA-L', colorCode: 'GRAY', sizeCode: 'L', stock: 14 },
    ],
  },
  {
    name: 'Beige Chair',
    slug: 'beige-chair',
    categorySlug: 'chairs',
    description:
      'Minimal beige chair designed for contemporary living and reading spaces.',
    price: '45.00',
    salePrice: '37.00',
    imageUrl: '/fuzzy/assets/images/product/5.png',
    variants: [
      { sku: 'CHA-BEI-BEI-S', colorCode: 'BEIGE', sizeCode: 'S', stock: 20 },
      { sku: 'CHA-BEI-WHI-M', colorCode: 'WHITE', sizeCode: 'M', stock: 16 },
    ],
  },
  {
    name: 'Lounge Chair',
    slug: 'lounge-chair',
    categorySlug: 'chairs',
    description:
      'A spacious lounge chair made for relaxed seating in modern interiors.',
    price: '160.00',
    salePrice: '130.00',
    imageUrl: '/fuzzy/assets/images/product/11.png',
    variants: [
      { sku: 'CHA-LOU-GRA-M', colorCode: 'GRAY', sizeCode: 'M', stock: 10 },
      { sku: 'CHA-LOU-BLA-L', colorCode: 'BLACK', sizeCode: 'L', stock: 8 },
    ],
  },
  {
    name: 'Hanging Chair',
    slug: 'hanging-chair',
    categorySlug: 'hanging-chairs',
    description:
      'A woven hanging chair that creates a comfortable indoor relaxation corner.',
    price: '180.00',
    salePrice: '149.00',
    imageUrl: '/fuzzy/assets/images/product/22.png',
    variants: [
      { sku: 'HAN-CHA-BRO-M', colorCode: 'BROWN', sizeCode: 'M', stock: 9 },
      { sku: 'HAN-CHA-BLA-L', colorCode: 'BLACK', sizeCode: 'L', stock: 7 },
    ],
  },
  {
    name: 'Mid Century Sofa',
    slug: 'mid-century-sofa',
    categorySlug: 'sofas',
    description:
      'Mid-century inspired sofa with clean lines and comfortable deep seating.',
    price: '999.00',
    imageUrl: '/fuzzy/assets/images/product/4.png',
    isFeatured: true,
    variants: [
      { sku: 'SOF-MID-GRA-M', colorCode: 'GRAY', sizeCode: 'M', stock: 6 },
      { sku: 'SOF-MID-BEI-L', colorCode: 'BEIGE', sizeCode: 'L', stock: 5 },
    ],
  },
  {
    name: 'Modern Blue Sofa',
    slug: 'modern-blue-sofa',
    categorySlug: 'sofas',
    description:
      'Modern sofa with soft cushioning and a bold silhouette for family spaces.',
    price: '720.00',
    salePrice: '650.00',
    imageUrl: '/fuzzy/assets/images/product/2.png',
    variants: [
      { sku: 'SOF-BLU-GRA-M', colorCode: 'GRAY', sizeCode: 'M', stock: 7 },
      { sku: 'SOF-BLU-BLA-L', colorCode: 'BLACK', sizeCode: 'L', stock: 4 },
    ],
  },
  {
    name: 'Side Table',
    slug: 'side-table',
    categorySlug: 'tables',
    description:
      'Compact wooden side table suitable for bedrooms and living rooms.',
    price: '80.00',
    salePrice: '50.00',
    imageUrl: '/fuzzy/assets/images/product/7.png',
    variants: [
      { sku: 'TAB-SID-BRO-S', colorCode: 'BROWN', sizeCode: 'S', stock: 30 },
      { sku: 'TAB-SID-BLA-M', colorCode: 'BLACK', sizeCode: 'M', stock: 19 },
    ],
  },
  {
    name: 'Marble Coffee Table',
    slug: 'marble-coffee-table',
    categorySlug: 'tables',
    description:
      'Elegant coffee table featuring a marble-look top and sturdy base.',
    price: '240.00',
    salePrice: '210.00',
    imageUrl: '/fuzzy/assets/images/product/21.png',
    variants: [
      { sku: 'TAB-MAR-WHI-M', colorCode: 'WHITE', sizeCode: 'M', stock: 11 },
      { sku: 'TAB-MAR-GRA-L', colorCode: 'GRAY', sizeCode: 'L', stock: 8 },
    ],
  },
  {
    name: 'Table Lamp',
    slug: 'table-lamp',
    categorySlug: 'lighting',
    description:
      'Compact table lamp that provides warm focused light for work or reading.',
    price: '49.00',
    salePrice: '37.00',
    imageUrl: '/fuzzy/assets/images/product/6.png',
    variants: [
      { sku: 'LIG-TAB-WHI-S', colorCode: 'WHITE', sizeCode: 'S', stock: 40 },
      { sku: 'LIG-TAB-BLA-S', colorCode: 'BLACK', sizeCode: 'S', stock: 32 },
    ],
  },
  {
    name: 'Hanging Light',
    slug: 'hanging-light',
    categorySlug: 'lighting',
    description:
      'Decorative hanging light designed to create a warm dining atmosphere.',
    price: '60.00',
    salePrice: '30.00',
    imageUrl: '/fuzzy/assets/images/product/13.png',
    variants: [
      { sku: 'LIG-HAN-BLA-M', colorCode: 'BLACK', sizeCode: 'M', stock: 22 },
      { sku: 'LIG-HAN-WHI-M', colorCode: 'WHITE', sizeCode: 'M', stock: 17 },
    ],
  },
  {
    name: 'Wooden Cabinet',
    slug: 'wooden-cabinet',
    categorySlug: 'cabinets',
    description:
      'Practical wooden cabinet with generous storage for organized interiors.',
    price: '460.00',
    salePrice: '420.00',
    imageUrl: '/fuzzy/assets/images/product/23.png',
    variants: [
      { sku: 'CAB-WOO-BRO-M', colorCode: 'BROWN', sizeCode: 'M', stock: 8 },
      { sku: 'CAB-WOO-BLA-L', colorCode: 'BLACK', sizeCode: 'L', stock: 6 },
    ],
  },
]

async function seedUsers() {
  const [adminPasswordHash, userPasswordHash] = await Promise.all([
    bcrypt.hash('Admin@123456', 12),
    bcrypt.hash('User@123456', 12),
  ])

  await prisma.user.upsert({
    where: { email: 'admin@fuzzy.local' },
    update: {
      passwordHash: adminPasswordHash,
      fullName: 'Fuzzy Administrator',
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@fuzzy.local',
      passwordHash: adminPasswordHash,
      fullName: 'Fuzzy Administrator',
      role: Role.ADMIN,
    },
  })

  await prisma.user.upsert({
    where: { email: 'user@fuzzy.local' },
    update: {
      passwordHash: userPasswordHash,
      fullName: 'Fuzzy Customer',
      role: Role.USER,
    },
    create: {
      email: 'user@fuzzy.local',
      passwordHash: userPasswordHash,
      fullName: 'Fuzzy Customer',
      role: Role.USER,
    },
  })
}

async function seedCatalog() {
  const categoryBySlug = new Map<string, string>()
  const colorByCode = new Map<string, string>()
  const sizeByCode = new Map<string, string>()

  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
    categoryBySlug.set(record.slug, record.id)
  }

  for (const color of colors) {
    const record = await prisma.color.upsert({
      where: { code: color.code },
      update: color,
      create: color,
    })
    colorByCode.set(record.code, record.id)
  }

  for (const size of sizes) {
    const record = await prisma.size.upsert({
      where: { code: size.code },
      update: size,
      create: size,
    })
    sizeByCode.set(record.code, record.id)
  }

  for (const seedProduct of products) {
    const categoryId = categoryBySlug.get(seedProduct.categorySlug)
    if (!categoryId) {
      throw new Error(`Category not found: ${seedProduct.categorySlug}`)
    }

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.upsert({
        where: { slug: seedProduct.slug },
        update: {
          categoryId,
          name: seedProduct.name,
          description: seedProduct.description,
          price: seedProduct.price,
          salePrice: seedProduct.salePrice ?? null,
          status: ProductStatus.ACTIVE,
          isFeatured: seedProduct.isFeatured ?? false,
        },
        create: {
          categoryId,
          name: seedProduct.name,
          slug: seedProduct.slug,
          description: seedProduct.description,
          price: seedProduct.price,
          salePrice: seedProduct.salePrice,
          status: ProductStatus.ACTIVE,
          isFeatured: seedProduct.isFeatured ?? false,
        },
      })

      const primaryImage = await tx.productImage.findFirst({
        where: { productId: product.id, sortOrder: 0 },
      })

      if (primaryImage) {
        await tx.productImage.update({
          where: { id: primaryImage.id },
          data: {
            imageUrl: seedProduct.imageUrl,
            alt: seedProduct.name,
          },
        })
      } else {
        await tx.productImage.create({
          data: {
            productId: product.id,
            imageUrl: seedProduct.imageUrl,
            alt: seedProduct.name,
            sortOrder: 0,
          },
        })
      }

      for (const variant of seedProduct.variants) {
        const colorId = colorByCode.get(variant.colorCode)
        const sizeId = sizeByCode.get(variant.sizeCode)

        if (!colorId || !sizeId) {
          throw new Error(`Invalid variant attributes for SKU ${variant.sku}`)
        }

        await tx.productVariant.upsert({
          where: { sku: variant.sku },
          update: {
            productId: product.id,
            colorId,
            sizeId,
            price: variant.price ?? null,
            stock: variant.stock,
          },
          create: {
            productId: product.id,
            colorId,
            sizeId,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
          },
        })
      }
    })
  }
}

async function main() {
  await seedUsers()
  await seedCatalog()

  const [userCount, categoryCount, productCount, imageCount, variantCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.category.count(),
      prisma.product.count(),
      prisma.productImage.count(),
      prisma.productVariant.count(),
    ])

  console.log({
    users: userCount,
    categories: categoryCount,
    products: productCount,
    images: imageCount,
    variants: variantCount,
  })
}

main()
  .catch((error: unknown) => {
    console.error('Database seed failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
