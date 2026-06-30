//  Service shutdown notice. Shown on login screen and across the app.
//  TODO: replace ANNOUNCEMENT_URL with the blog announcement link.
const ANNOUNCEMENT_URL = "https://orbiter.host/blog/orbiter-shutting-down";

export function ShutdownBanner() {
	return (
		<div className="w-full bg-destructive text-destructive-foreground text-sm text-center px-4 py-2">
			Orbiter is shutting down.{" "}
			<a
				href={ANNOUNCEMENT_URL}
				target="_blank"
				rel="noreferrer"
				className="underline font-medium"
			>
				Read the announcement
			</a>
		</div>
	);
}
