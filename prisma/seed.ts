import {
  BadgeType,
  NotificationType,
  PrismaClient,
  QuizType,
  Role,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN, isPro: true, name: "Admin" },
    create: { email, name: "Admin", role: Role.ADMIN, isPro: true },
  });

  const existingGame = await prisma.game.findFirst({
    where: { userId: admin.id, topic: "General Knowledge" },
  });

  let gameId = existingGame?.id;

  if (!existingGame) {
    const game = await prisma.game.create({
      data: {
        userId: admin.id,
        topic: "General Knowledge",
        type: QuizType.MCQ,
        amount: 3,
        isFinished: true,
        score: 2,
      },
    });

    gameId = game.id;

    await prisma.question.createMany({
      data: [
        {
          gameId: game.id,
          prompt: "Capital of France?",
          optionsJson: JSON.stringify(["Paris", "Rome", "Berlin", "Madrid"]),
          answer: "Paris",
          explanation: "Paris is the capital city of France.",
        },
        {
          gameId: game.id,
          prompt: "2 + 2 = ?",
          optionsJson: JSON.stringify(["3", "4", "5", "6"]),
          answer: "4",
          explanation: "Basic arithmetic: 2 plus 2 equals 4.",
        },
        {
          gameId: game.id,
          prompt: "Which planet is known as the Red Planet?",
          optionsJson: JSON.stringify(["Venus", "Mars", "Jupiter", "Mercury"]),
          answer: "Mars",
          explanation: "Mars appears red because of iron oxide on its surface.",
        },
      ],
    });
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: "Welcome to Quizmify",
        message: "Your admin account is ready. Start creating quizzes and managing players.",
        type: NotificationType.SUCCESS,
      },
      {
        userId: admin.id,
        title: "Premium active",
        message: "Pro access is enabled for the seeded admin account.",
        type: NotificationType.INFO,
      },
    ],
    skipDuplicates: true,
  });

  const badges = [
    {
      title: "First Quiz",
      description: "Complete your first quiz.",
      badgeType: BadgeType.ACHIEVEMENT,
      icon: "🎯",
    },
    {
      title: "Fast Learner",
      description: "Reach 80% accuracy in a topic.",
      badgeType: BadgeType.SCORE,
      icon: "⚡",
    },
    {
      title: "3-Day Streak",
      description: "Stay active for three days in a row.",
      badgeType: BadgeType.STREAK,
      icon: "🔥",
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { title: badge.title },
      update: badge,
      create: badge,
    });
  }

  const firstBadge = await prisma.badge.findUnique({ where: { title: "First Quiz" } });
  if (firstBadge) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: admin.id, badgeId: firstBadge.id } },
      update: {},
      create: { userId: admin.id, badgeId: firstBadge.id },
    });
  }

  await prisma.userProgress.upsert({
    where: { userId_topic: { userId: admin.id, topic: "General Knowledge" } },
    update: {
      quizzesCompleted: 1,
      totalQuestionsAttempted: 3,
      totalCorrectAnswers: 2,
      accuracy: 66.67,
      lastActivityAt: new Date(),
    },
    create: {
      userId: admin.id,
      topic: "General Knowledge",
      quizzesCompleted: 1,
      totalQuestionsAttempted: 3,
      totalCorrectAnswers: 2,
      accuracy: 66.67,
    },
  });

  if (gameId) {
    await prisma.quizReview.upsert({
      where: { userId_gameId: { userId: admin.id, gameId } },
      update: {
        rating: 5,
        reviewText: "Great starter quiz with clear explanations and balanced questions.",
      },
      create: {
        userId: admin.id,
        gameId,
        rating: 5,
        reviewText: "Great starter quiz with clear explanations and balanced questions.",
      },
    });
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
