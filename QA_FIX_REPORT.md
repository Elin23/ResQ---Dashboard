# ResQ Dashboard — QA Fix Report

هذه النسخة تعالج المشاكل التي ظهرت أثناء اختبار الربط الحقيقي بين Dashboard وBackend.

## 1. المنطقة المعتمدة لا تُقبل عند إضافة مكان للخريطة
**السبب:** المناطق تصل من `/api/dashboard/locations` متداخلة داخل المحافظة، بينما Adapter الواجهة لم يكن يحافظ دائمًا على `governorateId` للمنطقة، إضافة إلى اختلاف أسماء أنواع الأماكن بين الواجهة والـ backend.

**الإصلاح:** تطبيع المحافظات/المناطق والمحافظة على `governorateId`، وتوحيد place-type mapping. التحقق الحقيقي من أن المحافظة والمنطقة Active بقي في الـ backend.

## 2. فلاتر الجمعيات وعروض التبني والتبرعات
**السبب:** اختلاف query contracts، وبعض الفلاتر لم يكن الـ backend يدعمها أصلًا أو كان يتوقع Enum رقمي بدل النص المستخدم بالواجهة.

**الإصلاح:** توحيد query serialization بالواجهة وإضافة الفلاتر الضرورية بالـ backend عندما لا يمكن تنفيذها بشكل صحيح بعد pagination من الواجهة.

## 3. الفلاتر الفرعية لعروض التبني
تم تمرير `species`, `publisherType`, `organizationId`, `userId`, date range وsorting بشكل فعلي، وإضافة فلتر نوع الحيوان للواجهة.

## 4. الملاحظة الداخلية للمستخدم لا تظهر إلا بعد Refresh
تم تحديث React Query cache مباشرة عند نجاح إضافة الملاحظة ثم invalidation/refetch لضمان التزامن مع الخادم.

## 5. صور الإعلان لا تظهر
**السبب:** Form الواجهة كان يحتفظ بالصور لكن Create Advertisement لم يكن يرسلها للـ backend.

**الإصلاح:** إرسال `imageUrls` وتخزينها ضمن Attachments ثم إرجاعها في list/details. كما تم توحيد Resolver لمسارات الوسائط النسبية.

## 6. Content Overview يظهر أصفارًا
**السبب:** شكل response للـ overview لا يطابق الواجهة، ووجود اختلاف تاريخي بين `story` و`success-story`.

**الإصلاح:** overview مفصل (`articles`, `stories`, `awareness`, `faq`) ودعم سجلات `story` القديمة بجانب `success-story`، مع تحويل السجل القديم عند تعديله.

## 7. تأكيد تسجيل الخروج
تمت إضافة ConfirmDialog الخاص بالواجهة قبل تنفيذ Logout بدون استخدام `window.confirm`.

## 8. فلتر نوع الحيوان في البلاغات
الواجهة ترسل `animalType` والـ backend يطبقه على الاستعلام قبل pagination.

## 9. طلبات الظهور على الخريطة لا تظهر
**السبب:** PlaceRequest كان يُصنّف في Adapter حسب `placeType` قبل `source`, فيتحول بعض الطلبات إلى auto entity.

**الإصلاح:** `PLACE_REQUEST` له أولوية ويُصنف `USER_REQUEST`، مع الحفاظ على `sourceId` الحقيقي لعمليات approve/reject.

## 10. تفاصيل حيوان التبني ناقصة
تم توسيع response وعرض الجنس، العمر، الصحة، اللقاحات، الفحص البيطري، الأمراض المعدية، الصور وبيانات الناشر.

## 11. فلترة عروض التبني حسب المستخدم
أضيف `userId` إلى backend query وإلى frontend query serializer.

## 12. حساب ناشر عرض التبني لا يفتح
تم إرجاع ID الحقيقي حسب نوع الناشر: Organization ID للجمعية وUser UUID للمستخدم.

## 13. ملخص الجمعيات وحالة التحقق وتغيير الحالة
تم توحيد أسماء حقول summary مع الواجهة، واختيار أحدث ModerationRecord بدل احتمالية duplicate-key، وتصحيح mapping حالة التحقق، وحفظ حالة التعليق/التعطيل في Organization نفسه وليس في UI فقط.

## 14. بيانات الجمعية لا تظهر
تم توسيع Details لتشمل Place/location/contact/documents/notes/report counts والبيانات الأساسية المطلوبة للواجهة.

## 15. فلتر التعبئات وملخصات نقاط الإطعام
تم تطبيق `pendingRefills` قبل pagination وإرجاع counters حقيقية للتعبئات والمشاكل والحالات.

## 16. تعطيل نقطة الإطعام لا يبقى محفوظًا
تم تحديث `FoodPoint.Status` في قاعدة البيانات وحفظه، ثم refetch/invalidation في React Query لمنع ظهور الحالة القديمة من cache.

# إصلاحات إضافية ناتجة عن التدقيق
- توحيد مسارات الصور والوسائط النسبية مع `VITE_API_BASE_URL`.
- حماية من IDs الواجهة المركبة مثل `request-123` في map mutations باستخدام `sourceId` الحقيقي.
- دعم legacy `story` في المحتوى حتى لا يكون overview غير متسق مع قائمة قصص النجاح.
- رسائل الخطأ للمستخدم بقيت عربية ومفهومة عبر طبقة الخطأ المركزية.

# ملاحظات نشر
Frontend:
- `VITE_DATA_SOURCE=api`
- `VITE_API_BASE_URL=https://resqback.runasp.net`

Backend:
- يجب أن يحتوي CORS على origin الدقيق لـ Vercel.
- الأسرار وقاعدة البيانات تبقى Environment Variables على الاستضافة.

# التحقق المنفذ في بيئة العمل
- `npm test`: نجح 27/27 بعد إضافة اختبارات regressions الخاصة بالمشاكل الحالية.
- فحص TypeScript syntax/transpile لكل ملفات `src`: نجح.
- لا يوجد .NET SDK في بيئة التنفيذ، لذلك يجب تشغيل `dotnet build` على جهازكم/CI قبل النشر.
- تنزيل dependencies للـ frontend في بيئة التنفيذ تعرض timeout، لذلك يجب تشغيل `npm install && npm run build` محليًا قبل رفع Vercel.
