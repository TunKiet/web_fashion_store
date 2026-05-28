from api.models import Category

class CategoryService:
    @staticmethod
    def get_categories(trash=False):
        if trash:
            return Category.objects.filter(is_deleted=True)
        return Category.objects.filter(is_deleted=False)

    @staticmethod
    def create_category(validated_data):
        return Category.objects.create(**validated_data)

    @staticmethod
    def update_category(category_id, validated_data):
        category = Category.objects.get(pk=category_id)
        for attr, value in validated_data.items():
            setattr(category, attr, value)
        category.save()
        return category

    @staticmethod
    def delete_category(category_id):
        category = Category.objects.get(pk=category_id)
        category.is_deleted = True
        category.save()
        return category

    @staticmethod
    def restore_category(category_id):
        category = Category.objects.get(pk=category_id)
        category.is_deleted = False
        category.save()
        return category

    @staticmethod
    def force_delete_category(category_id):
        category = Category.objects.get(pk=category_id)
        name = category.name
        category.delete()
        return name
