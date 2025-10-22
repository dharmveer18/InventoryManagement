from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from .models import User, Roles

ROLE_TO_GROUP = {Roles.ADMIN: "admin", Roles.MANAGER: "manager", Roles.VIEWER: "viewer"}

@receiver(post_save, sender=User)
def sync_user_group(sender, instance: User, **kwargs):
    # remove from all role groups
    for name in ROLE_TO_GROUP.values():
        try: instance.groups.remove(Group.objects.get(name=name))
        except Group.DoesNotExist: pass
    # add to current role group
    grp = Group.objects.get(name=ROLE_TO_GROUP[instance.role])
    instance.groups.add(grp)
