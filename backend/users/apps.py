from django.apps import AppConfig

from django.db.models.signals import post_migrate

def ensure_perm(model, codename):
    from django.contrib.auth.models import Permission
    from django.contrib.contenttypes.models import ContentType
    ct = ContentType.objects.get_for_model(model)
    perm, _ = Permission.objects.get_or_create(
        content_type=ct,
        codename=codename,
        defaults={'name': f'Can {codename.split("_", 1)[0]} {model._meta.verbose_name}'},
    )
    return perm
    
def bootstrap_roles_and_perms(sender, **kwargs):
    from django.contrib.auth.models import Group, Permission
    from django.contrib.contenttypes.models import ContentType
    from inventory.models import Item, Category

    def perms_for(model):
        return {p.codename: p for p in Permission.objects.filter(
            content_type=ContentType.objects.get_for_model(model)
        )}

    g_admin, _ = Group.objects.get_or_create(name="admin")
    g_manager, _ = Group.objects.get_or_create(name="manager")
    g_viewer, _ = Group.objects.get_or_create(name="viewer")

   # ensure permissions exist
    item_add    = ensure_perm(Item, "add_item")
    item_change = ensure_perm(Item, "change_item")
    item_delete = ensure_perm(Item, "delete_item")
    item_view   = ensure_perm(Item, "view_item")

    cat_add     = ensure_perm(Category, "add_category")
    cat_change  = ensure_perm(Category, "change_category")
    cat_delete  = ensure_perm(Category, "delete_category")
    cat_view    = ensure_perm(Category, "view_category")

    g_admin.permissions.set([item_add, item_change, item_delete, item_view,
                            cat_add, cat_change, cat_delete, cat_view])
    g_manager.permissions.set([item_change, item_view, cat_view])
    g_viewer.permissions.set([item_view, cat_view])

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
    def ready(self):
        from . import signals  # sync role->group
        post_migrate.connect(bootstrap_roles_and_perms, sender=self)