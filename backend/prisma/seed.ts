import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if vehicles already exist to prevent duplicate seeding
  const count = await prisma.vehicle.count();
  if (count > 0) {
    console.log('Database already has vehicles. Skipping seed.');
    return;
  }

  console.log('Seeding initial vehicles...');

  const vehicles = [
    {
      make: 'Tesla',
      model: 'Model S Plaid',
      category: 'Electric',
      price: 89990,
      quantity: 3,
    },
    {
      make: 'Porsche',
      model: '911 Carrera',
      category: 'Coupe',
      price: 114400,
      quantity: 2,
    },
    {
      make: 'Ford',
      model: 'F-150 Lightning',
      category: 'Electric',
      price: 54995,
      quantity: 5,
    },
    {
      make: 'Honda',
      model: 'Civic Type R',
      category: 'Hatchback',
      price: 43795,
      quantity: 2,
    },
    {
      make: 'Toyota',
      model: 'RAV4 Hybrid',
      category: 'SUV',
      price: 31725,
      quantity: 8,
    },
    {
      make: 'BMW',
      model: 'M4 Competition',
      category: 'Coupe',
      price: 78100,
      quantity: 1,
    },
    {
      make: 'Chevrolet',
      model: 'Silverado 1500',
      category: 'Truck',
      price: 36800,
      quantity: 4,
    },
    {
      make: 'Audi',
      model: 'A4 Sedan',
      category: 'Sedan',
      price: 41200,
      quantity: 6,
    },
    {
      make: 'Mazda',
      model: 'MX-5 Miata',
      category: 'Convertible',
      price: 28980,
      quantity: 0, // Out of stock on start to test out-of-stock styles!
    },
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.create({
      data: vehicle,
    });
  }

  console.log('Database successfully seeded with 9 vehicles!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
