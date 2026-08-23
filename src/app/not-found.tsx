import { FileQuestion } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="flex justify-center py-20 sm:py-28">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-50 text-brand-600">
          <FileQuestion className="size-7" aria-hidden="true" />
        </span>

        <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">Page not found</h1>
        <p className="mt-3 leading-relaxed text-muted">
          The page you were looking for does not exist, or the request you tried to open is not
          one you have access to.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/track" variant="outline">
            Track a request
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
