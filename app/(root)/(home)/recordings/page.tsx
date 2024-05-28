import CallList from "@/components/calls/CallList";

const RecordingsPage = () => {
	return (
		<section className="flex size-full flex-col gap-10 px-4 py-5 md:py-0">
			<h1 className="text-3xl font-bold">Recorded Calls</h1>

			<CallList type="recordings" />
		</section>
	);
};

export default RecordingsPage;
