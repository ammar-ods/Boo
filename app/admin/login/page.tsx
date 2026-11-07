import { loginAdmin } from "@/actions/admin";
import { BooLogo } from "@/components/brand/boo-logo";
import { Label } from "@/components/ui/label";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <form
        action={loginAdmin}
        className="w-full max-w-sm space-y-4 rounded-[1.6rem] bg-white p-8 ring-1 ring-foreground/10"
      >
        <BooLogo />
        <h1 className="font-heading text-3xl">Studio desk</h1>
        <p className="text-sm text-muted-foreground">
          Studio password unlocks orders and the product catalog editor.
        </p>
        {error ? (
          <p className="text-sm text-destructive">That password did not match.</p>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="h-8 w-full rounded-lg border border-input px-2.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="h-9 w-full rounded-full bg-oxford font-heading text-white"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
