// Trigger f when enter is pressed
export const onEnter = (f: () => any) =>
    (e: React.KeyboardEvent) => e.keyCode == 13 ? f() : null;
