# Webová aplikce s eshopem

Tento projekt je moderní webová aplikace postavená na frameworku **Next.js** s použitím **TypeScriptu**, **Tailwind CSS** a **Resend** pro odesílání emailů. Obsahuje jak veřejnou část pro zákazníky, tak administrační rozhraní pro správu obsahu.

## Předpoklady

- Mít nainstalované [Node.js a NPM](https://nodejs.org/en)
- Vytvořený účet na [Supabase](https://supabase.com/)
- Vytvořený projekt na Supabase (viz níže)

## Technologie

- [Next.js](https://nextjs.org/) – React framework pro server-side rendering a routing
- [TypeScript](https://www.typescriptlang.org/) – typovaný JavaScript
- [Tailwind CSS](https://tailwindcss.com/) – CSS framework
- [Supabase](https://supabase.com/) - backend-as-a-service (databáze, autentizace, API)
- [Resend](https://resend.com/) – služba pro odesílání e-mailů

## Nastavení a konfigurace

Pro správné fungování aplikace je nutné nastavit služby Supabase a Resend.

### 1. Klonování repozitáře

```bash
git clone https://github.com/japkox/farmaplevnice.cz farmaplevnice
cd farmaplevnice
```

### 2. Instalace závislostí

```bash
npm install
```

### 3. Konfigurace prostředí

V kořenovém adresáři projektu vytvořte soubor `.env` podle šablony `.env.example` a vyplňte potřebné hodnoty:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_TO_EMAIL=
```

### 4. Nastavení databáze

Pro napojení databáze je nutné vytvořit databázi na platformě **[Supabase](https://supabase.com/)**, naimportovat tabulky a nastavit odpovídající proměnné v `.env`.

#### 1. Vytvoření projektu na Supabase

1. Přejděte na [Supabase](https://app.supabase.com/)
2. Přihlaste se nebo si založte účet
3. Klikněte na **"New Project"**
4. Vyplňte následující:
   - Název projektu
   - Heslo pro databázi
   - Vyber region
5. Klikněte na **"Create new project"**

#### 2. Získání přístupových údajů

Po vytvoření projektu:
- V levém panelu přejděte na **Project Settings > Data API**
- Zkopírujte si:
  - `URL`
  - `anon public klíč`

a tyto hodnoty přidejte do souboru .env

#### 3. Import SQL databáze

1. V levém panelu přejděte na **SQL Editor**
2. Vložte celý obsah souboru `db.sql`, který se nachází v projektu 
3. Spusťte skript kliknutím na **"RUN"**

### 4. Vypnutí ověřování e-mailu

Ve výchozím nastavení Supabase vyžaduje ověření e-mailové adresy po registraci uživatele. Pokud tuto funkcionalitu nechcete používat, můžete ji vypnout:

1. V levém panelu přejděte na **Authentication > Sign In / Up**
2. Klikněte na providera **Email** a přepněte přepínač `Confirm email`
3. Uložte změny

Nyní lze vytvářet uživatele bez nutnosti potvrzovat e-mail.

### 5. Nastavení Resend

Pokud chcete používat Resend pro odesílání e-mailů, musíte si vytvořit účet na [Resend](https://resend.com/) a získat API klíč.

1. Vytvořte si účet na stránce [Resend](https://resend.com/)
2. Vygenerujte API klíč na [Resend API](https://resend.com/api-keys), oprávnění nastavte na "Full access"
3. Přidejte a ověřte svou doménu
  - V levém menu přejděte do sekce **Domains**
  - Klikněte na **"Add Domain"**
  - Zadejte svou doménu a aplikace vás provede nastavením DNS záznamů
4. Přidejte získané hodnoty do souboru .env
  - API klíč
  - Email odesílatele: např. `info@vasedomena.cz`
  - Email příjemce: např. `admin@vasedomena.cz`

### 6. Nastavení administrátorských práv

Administrátorská práva lze nastavít přímo v databázi v Supabase

1. V levém panelu přejděte na **Table Editor**
2. Přejděte na schéma **public**
3. Vyberte tabulku **profiles**
4. Nastavte hodnotu `is_admin` na `true` pro uživatele, kterému chcete udělit administrátorská práva

Pro další uživatele lze nastavit práva i přes administrační rozhraní aplikace

### 6. Spuštění aplikace

```bash
npm run dev
```

Aplikace poběží na `http://localhost:3000`.

#### V případě, že se po otevření vyvojářské aplikace zobrazuje pouze bílá stránka, je nutné vypnout AdBlock!
