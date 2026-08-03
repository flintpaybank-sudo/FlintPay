import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDb, schema } from './src/db/index';
import { eq, desc } from 'drizzle-orm';

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: process.env.DATABASE_URL ? 'connected' : 'configured' });
});

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nom, postnom, email, telephone, password, parrainCode } = req.body;
    if (!email || !nom || !telephone) {
      return res.status(400).json({ error: 'Champs obligatoires manquants (nom, email, téléphone)' });
    }

    const userId = `FPAY-${Math.floor(100000 + Math.random() * 900000)}`;
    const referralCode = `FLINT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = {
      id: userId,
      nom,
      postnom: postnom || '',
      email,
      telephone,
      password: password || '123456',
      role: 'user',
      level: 'adherant',
      kycStatus: 'pending',
      referralCode,
      parrainCode: parrainCode || null,
      createdAt: new Date(),
    };

    const newWallet = {
      id: `WLT-${userId}`,
      userId: userId,
      balanceUSD: '0.00',
      balanceCDF: '0.00',
      savingsUSD: '0.00',
      savingsCDF: '0.00',
      totalInvestedUSD: '0.00',
      totalInvestedCDF: '0.00',
      updatedAt: new Date(),
    };

    const db = getDb();
    if (db) {
      await db.insert(schema.users).values(newUser);
      await db.insert(schema.wallets).values(newWallet);
    }

    return res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: newUser,
      wallet: newWallet,
    });
  } catch (error: any) {
    console.error('Erreur inscription:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors de l\'inscription' });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();
    if (db) {
      const foundUsers = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      if (foundUsers.length > 0) {
        const user = foundUsers[0];
        const wallets = await db.select().from(schema.wallets).where(eq(schema.wallets.userId, user.id)).limit(1);
        return res.json({ user, wallet: wallets[0] || null });
      }
    }
    return res.status(401).json({ error: 'Identifiants invalides' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Erreur d\'authentification' });
  }
});

// Wallet Balance Update (Deposits / Withdrawals / Click Earnings)
app.post('/api/wallets/update-balance', async (req, res) => {
  try {
    const { userId, balanceUSD, balanceCDF, savingsUSD, savingsCDF } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }

    const db = getDb();
    if (db) {
      await db
        .update(schema.wallets)
        .set({
          balanceUSD: balanceUSD !== undefined ? String(balanceUSD) : undefined,
          balanceCDF: balanceCDF !== undefined ? String(balanceCDF) : undefined,
          savingsUSD: savingsUSD !== undefined ? String(savingsUSD) : undefined,
          savingsCDF: savingsCDF !== undefined ? String(savingsCDF) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(schema.wallets.userId, userId));
    }

    return res.json({ success: true, message: 'Solde mis à jour avec succès' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Erreur lors de la mise à jour du solde' });
  }
});

// Transactions: List by user
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDb();
    if (db) {
      const userTxns = await db
        .select()
        .from(schema.transactions)
        .where(eq(schema.transactions.userId, userId))
        .orderBy(desc(schema.transactions.createdAt));
      return res.json({ transactions: userTxns });
    }
    return res.json({ transactions: [] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Transactions: Create new (Deposit / Withdrawal / Transfer)
app.post('/api/transactions', async (req, res) => {
  try {
    const { userId, userName, type, currency, amount, feeAmount, netAmount, paymentMethod, paymentProofUrl, destinationAccount } = req.body;
    if (!userId || !type || !currency || !amount) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const txId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newTx = {
      id: txId,
      userId,
      userName: userName || 'Utilisateur',
      type,
      currency,
      amount: String(amount),
      feeAmount: String(feeAmount || 0),
      netAmount: String(netAmount || amount),
      paymentMethod,
      paymentProofUrl,
      destinationAccount,
      status: 'pending',
      createdAt: new Date(),
    };

    const db = getDb();
    if (db) {
      await db.insert(schema.transactions).values(newTx);
    }

    return res.status(201).json({ message: 'Transaction créée avec succès', transaction: newTx });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Savings: List & Create
app.get('/api/savings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDb();
    if (db) {
      const userSavings = await db
        .select()
        .from(schema.savings)
        .where(eq(schema.savings.userId, userId))
        .orderBy(desc(schema.savings.createdAt));
      return res.json({ savings: userSavings });
    }
    return res.json({ savings: [] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/savings', async (req, res) => {
  try {
    const { userId, currency, principalAmount, interestRate, lockMonths } = req.body;
    const db = getDb();
    const id = `SAV-${Date.now()}`;
    const newSavings = {
      id,
      userId,
      currency,
      principalAmount: String(principalAmount),
      interestRate: String(interestRate || 0.04),
      lockMonths: lockMonths || 6,
      startDate: new Date(),
      status: 'active',
      createdAt: new Date(),
    };
    if (db) {
      await db.insert(schema.savings).values(newSavings);
    }
    return res.status(201).json({ message: 'Épargne créée', savings: newSavings });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// KYC: Submit
app.post('/api/kyc', async (req, res) => {
  try {
    const { userId, nom, postnom, sexe, dateNaissance, typePiece, photoPieceUrl, pays, telephone } = req.body;
    const db = getDb();
    const id = `KYC-${userId}`;
    const newKyc = {
      id,
      userId,
      nom,
      postnom,
      sexe,
      dateNaissance,
      typePiece,
      photoPieceUrl,
      pays,
      telephone,
      status: 'pending',
      submittedAt: new Date(),
    };
    if (db) {
      await db.insert(schema.kyc).values(newKyc);
      await db.update(schema.users).set({ kycStatus: 'pending' }).where(eq(schema.users.id, userId));
    }
    return res.status(201).json({ message: 'Demande KYC soumise', kyc: newKyc });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Delete / Reject User Account
app.delete('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDb();
    if (db) {
      await db.delete(schema.wallets).where(eq(schema.wallets.userId, userId));
      await db.delete(schema.kyc).where(eq(schema.kyc.userId, userId));
      await db.delete(schema.savings).where(eq(schema.savings.userId, userId));
      await db.delete(schema.transactions).where(eq(schema.transactions.userId, userId));
      await db.delete(schema.users).where(eq(schema.users.id, userId));
    }
    return res.json({ success: true, message: `Compte ${userId} supprimé définitivement` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Vite Middleware for Dev / Static serving for Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur FlintPay démarré sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
