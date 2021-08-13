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

    async setConfigPerms(context) {
        let managerRoles = [];
        let permissions = [{
            id: '241901692298330112',
            type: 'USER',
            permission: true,
        }];
        let configCommand = await (await context.guild.commands.fetch().catch(console.error)).find(cmd => cmd.name === 'config');
    
        await this.getRolesByPermission(context.guild, managerRoles, 'MANAGE_GUILD');

        let permissionChange = false
        managerRoles.forEach(async elem => { permissions.push({
                id: `${elem}`,
                type: 'ROLE',
                permission: true,
                })

                if (await configCommand.permissions.has({permissionId:`${elem}`}).then().catch(console.error)) {
                    permissionChange = true;
                }
            });

        if (permissionChange) {
            await configCommand.permissions.add({ permissions });
            console.log('Perms set.')
        }
    }

}

module.exports = ThreadBotHelpers;