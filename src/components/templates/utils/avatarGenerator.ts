const AVATAR_COLORS = ['0D9488', '059669', '0891B2', '6366F1', 'EC4899', 'F59E0B'];

export function generateAvatar(name: string, size: number = 100): string {
    const colorIndex = Math.abs(
        name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % AVATAR_COLORS.length;

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${AVATAR_COLORS[colorIndex]}&color=fff&size=${size}&bold=true`;
}

export function generateRandomNames(count: number): string[] {
    const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'James', 'Sophia', 'William', 'Isabella', 'Oliver'];
    const lastInitials = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

    return Array.from({ length: count }, () => {
        const first = firstNames[Math.floor(Math.random() * firstNames.length)];
        const last = lastInitials[Math.floor(Math.random() * lastInitials.length)];
        return `${first} ${last}`;
    });
}

export function generateClaimedAvatars(count: number = 3): string[] {
    const names = generateRandomNames(count);
    return names.map(name => generateAvatar(name, 50));
}
