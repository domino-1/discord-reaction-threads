class ThreadBotHelpers {
    
    async getRolesByPermission(gld, outputArray, perm) {
        await gld.roles.fetch()
        .then(roles => {
            roles
                .filter(role => role.permissions.has(perm))
                .each(role => outputArray.push(role.id));
        })
        .catch(console.error);
    }

    async setCommandPerms(context, target, permission) {
        let roles = [];
        let permissions = [];
        let command = await (await context.guild.commands.fetch().catch(console.error)).find(cmd => cmd.name === `${target}`);
        
        await this.getRolesByPermission(context.guild, roles, permission);

        roles.forEach(elem => {
            permissions.push(
                {
                id: `${elem}`,
                permission: true,
                type: 'ROLE',
                }
            );
        });

        let oldPerms = await command.permissions.fetch()
            .catch(console.error);
        if (oldPerms.length != permissions.length) {
            await command.permissions.set({ permissions });
            console.log("Perms updated");
        }
        
    }

    async isLingeringThread(thread) {
        const parentMessage = await thread.parent.messages.fetch(thread.id);
        if ( parentMessage.components[0] ) {
            if (parentMessage.components[0].components[0] ) {
                if( parentMessage.components[0].components[0].customId === 'lingering_thread_join') {
                    return true;
                }
            }
        }
        return false;
    }

}

module.exports = ThreadBotHelpers;