import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient, Role } from '../src/generated/prisma/client'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

function duplicates(values: string[]) {
  const seen = new Set<string>()
  const duplicateValues = new Set<string>()

  for (const value of values) {
    if (seen.has(value)) {
      duplicateValues.add(value)
    }
    seen.add(value)
  }

  return [...duplicateValues]
}

async function main() {
  const [
    userCount,
    categoryCount,
    productCount,
    imageCount,
    variantCount,
    admin,
    user,
    products,
    variants,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.productImage.count(),
    prisma.productVariant.count(),
    prisma.user.findUnique({
      where: { email: 'admin@fuzzy.local' },
      select: { role: true },
    }),
    prisma.user.findUnique({
      where: { email: 'user@fuzzy.local' },
      select: { role: true },
    }),
    prisma.product.findMany({
      select: {
        name: true,
        slug: true,
        _count: { select: { images: true, variants: true } },
      },
    }),
    prisma.productVariant.findMany({ select: { sku: true } }),
  ])

  const productsWithoutImages = products
    .filter((product) => product._count.images === 0)
    .map((product) => product.name)
  const productsWithoutVariants = products
    .filter((product) => product._count.variants === 0)
    .map((product) => product.name)
  const duplicateSkus = duplicates(variants.map((variant) => variant.sku))
  const duplicateSlugs = duplicates(products.map((product) => product.slug))
  const rolesValid = admin?.role === Role.ADMIN && user?.role === Role.USER
  const valid =
    rolesValid &&
    productsWithoutImages.length === 0 &&
    productsWithoutVariants.length === 0 &&
    duplicateSkus.length === 0 &&
    duplicateSlugs.length === 0

  console.log({
    counts: {
      users: userCount,
      categories: categoryCount,
      products: productCount,
      images: imageCount,
      variants: variantCount,
    },
    rolesValid,
    productsWithoutImages,
    productsWithoutVariants,
    duplicateSkus,
    duplicateSlugs,
    valid,
  })

  if (!valid) {
    process.exitCode = 1
  }
}

main()
  .catch((error: unknown) => {
    console.error('Seed verification failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
